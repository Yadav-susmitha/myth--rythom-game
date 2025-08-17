import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class MythRealmsAPITester:
    def __init__(self, base_url="https://cosmos-chronicles.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_ids = {
            'documents': [],
            'characters': [],
            'weapons': [],
            'quests': [],
            'music': []
        }

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, data: Optional[Dict] = None, params: Optional[Dict] = None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and 'id' in response_data:
                        print(f"   Created ID: {response_data['id']}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        success, response = self.run_test("API Root", "GET", "", 200)
        return success

    def test_dashboard_stats(self):
        """Test dashboard stats endpoint"""
        success, response = self.run_test("Dashboard Stats", "GET", "dashboard/stats", 200)
        if success and isinstance(response, dict):
            print(f"   Stats: {response}")
        return success

    def test_document_management(self):
        """Test document CRUD operations"""
        print("\n📄 Testing Document Management...")
        
        # Test create document
        doc_data = {
            "title": "Test GDD Document",
            "document_type": "gdd",
            "content": {
                "overview": "Test game overview",
                "mechanics": "Test game mechanics"
            },
            "tags": ["test", "gdd"]
        }
        
        success, response = self.run_test("Create Document", "POST", "documents", 200, doc_data)
        if success and 'id' in response:
            doc_id = response['id']
            self.created_ids['documents'].append(doc_id)
            
            # Test get document by ID
            self.run_test("Get Document by ID", "GET", f"documents/{doc_id}", 200)
            
            # Test update document
            update_data = {
                "title": "Updated Test GDD Document",
                "content": {
                    "overview": "Updated game overview",
                    "mechanics": "Updated game mechanics"
                }
            }
            self.run_test("Update Document", "PUT", f"documents/{doc_id}", 200, update_data)
        
        # Test get all documents
        self.run_test("Get All Documents", "GET", "documents", 200)
        
        # Test get documents by type
        self.run_test("Get Documents by Type", "GET", "documents", 200, params={"document_type": "gdd"})
        
        return True

    def test_character_management(self):
        """Test character CRUD operations"""
        print("\n👤 Testing Character Management...")
        
        # Test create character
        char_data = {
            "name": "Test Hero Character",
            "description": "A brave test hero",
            "realm": "forest",
            "character_type": "hero",
            "emotions": {
                "joy": "Smiling brightly",
                "calm": "Peaceful expression"
            },
            "stats": {
                "health": 100,
                "strength": 80,
                "magic": 60
            }
        }
        
        success, response = self.run_test("Create Character", "POST", "characters", 200, char_data)
        if success and 'id' in response:
            char_id = response['id']
            self.created_ids['characters'].append(char_id)
            
            # Test get character by ID
            self.run_test("Get Character by ID", "GET", f"characters/{char_id}", 200)
        
        # Test get all characters
        self.run_test("Get All Characters", "GET", "characters", 200)
        
        # Test get characters by realm
        self.run_test("Get Characters by Realm", "GET", "characters", 200, params={"realm": "forest"})
        
        # Test get characters by type
        self.run_test("Get Characters by Type", "GET", "characters", 200, params={"character_type": "hero"})
        
        return True

    def test_weapon_management(self):
        """Test weapon CRUD operations"""
        print("\n⚔️ Testing Weapon Management...")
        
        # Test create weapon
        weapon_data = {
            "name": "Test Sword",
            "weapon_type": "sword",
            "lore": "A legendary test sword",
            "damage_profile": {
                "physical": 75,
                "spirit": 25
            },
            "combo_path": ["light", "heavy", "ability"]
        }
        
        success, response = self.run_test("Create Weapon", "POST", "weapons", 200, weapon_data)
        if success and 'id' in response:
            weapon_id = response['id']
            self.created_ids['weapons'].append(weapon_id)
        
        # Test get all weapons
        self.run_test("Get All Weapons", "GET", "weapons", 200)
        
        # Test get weapons by type
        self.run_test("Get Weapons by Type", "GET", "weapons", 200, params={"weapon_type": "sword"})
        
        return True

    def test_quest_management(self):
        """Test quest CRUD operations"""
        print("\n🗡️ Testing Quest Management...")
        
        # Test create quest
        quest_data = {
            "title": "Test Quest",
            "description": "A challenging test quest",
            "realm": "forest",
            "quest_type": "main",
            "objectives": [
                "Find the test item",
                "Defeat the test enemy",
                "Return to test NPC"
            ]
        }
        
        success, response = self.run_test("Create Quest", "POST", "quests", 200, quest_data)
        if success and 'id' in response:
            quest_id = response['id']
            self.created_ids['quests'].append(quest_id)
        
        # Test get all quests
        self.run_test("Get All Quests", "GET", "quests", 200)
        
        # Test get quests by realm
        self.run_test("Get Quests by Realm", "GET", "quests", 200, params={"realm": "forest"})
        
        # Test get quests by type
        self.run_test("Get Quests by Type", "GET", "quests", 200, params={"quest_type": "main"})
        
        return True

    def test_music_management(self):
        """Test music CRUD operations"""
        print("\n🎵 Testing Music Management...")
        
        # Test create music track
        music_data = {
            "name": "Test Forest Theme",
            "realm": "forest",
            "mood": "exploration",
            "tempo": 120,
            "key": "C Major",
            "instrumentation": ["strings", "flute", "harp"]
        }
        
        success, response = self.run_test("Create Music Track", "POST", "music", 200, music_data)
        if success and 'id' in response:
            music_id = response['id']
            self.created_ids['music'].append(music_id)
        
        # Test get all music tracks
        self.run_test("Get All Music Tracks", "GET", "music", 200)
        
        # Test get music by realm
        self.run_test("Get Music by Realm", "GET", "music", 200, params={"realm": "forest"})
        
        # Test get music by mood
        self.run_test("Get Music by Mood", "GET", "music", 200, params={"mood": "exploration"})
        
        return True

    def test_asset_management(self):
        """Test asset management (basic GET only since file upload is complex)"""
        print("\n📁 Testing Asset Management...")
        
        # Test get all assets
        self.run_test("Get All Assets", "GET", "assets", 200)
        
        # Test get assets by category
        self.run_test("Get Assets by Category", "GET", "assets", 200, params={"category": "image"})
        
        return True

    def test_search_functionality(self):
        """Test search across all content"""
        print("\n🔍 Testing Search Functionality...")
        
        # Test search with various queries
        search_queries = ["test", "forest", "sword", "hero"]
        
        for query in search_queries:
            self.run_test(f"Search for '{query}'", "GET", "search", 200, params={"query": query})
        
        return True

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting MythRealms API Tests...")
        print(f"Testing against: {self.base_url}")
        
        # Test API connectivity
        if not self.test_api_root():
            print("❌ API root test failed, stopping tests")
            return 1
        
        # Test dashboard
        self.test_dashboard_stats()
        
        # Test all management systems
        self.test_document_management()
        self.test_character_management()
        self.test_weapon_management()
        self.test_quest_management()
        self.test_music_management()
        self.test_asset_management()
        
        # Test search
        self.test_search_functionality()
        
        # Print final results
        print(f"\n📊 Final Results:")
        print(f"Tests passed: {self.tests_passed}/{self.tests_run}")
        print(f"Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.created_ids['documents']:
            print(f"Created documents: {len(self.created_ids['documents'])}")
        if self.created_ids['characters']:
            print(f"Created characters: {len(self.created_ids['characters'])}")
        if self.created_ids['weapons']:
            print(f"Created weapons: {len(self.created_ids['weapons'])}")
        if self.created_ids['quests']:
            print(f"Created quests: {len(self.created_ids['quests'])}")
        if self.created_ids['music']:
            print(f"Created music tracks: {len(self.created_ids['music'])}")
        
        return 0 if self.tests_passed == self.tests_run else 1

def main():
    tester = MythRealmsAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())