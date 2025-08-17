from fastapi import FastAPI, APIRouter, HTTPException, File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from enum import Enum
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="MythRealms GDD & Content Management Platform")

# Create router with /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class DocumentType(str, Enum):
    GDD = "gdd"
    CONCEPT_ART = "concept_art"
    CHARACTER_DESIGN = "character_design"
    WEAPON_SHEET = "weapon_sheet"
    MUSIC_SYSTEM = "music_system"
    DIALOGUE = "dialogue"

class RealmType(str, Enum):
    FOREST = "forest"
    MOUNTAIN = "mountain" 
    UNDERWORLD = "underworld"
    GALAXY = "galaxy"
    HUB_VILLAGE = "hub_village"

class WeaponType(str, Enum):
    SWORD = "sword"
    SPEAR = "spear"
    BOW = "bow"
    CHAKRAM = "chakram"
    STAFF = "staff"
    GREATSWORD = "greatsword"

class EmotionState(str, Enum):
    JOY = "joy"
    CALM = "calm"
    FEAR = "fear"
    RAGE = "rage"
    SORROW = "sorrow"

# Base Models
class BaseDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    document_type: DocumentType
    content: Dict[str, Any] = Field(default_factory=dict)
    tags: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    version: int = Field(default=1)

class Asset(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    file_path: str
    file_type: str
    category: str  # "image", "audio", "document", "video"
    tags: List[str] = Field(default_factory=list)
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Character(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    realm: RealmType
    character_type: str  # "hero", "npc", "enemy", "boss"
    emotions: Dict[EmotionState, str] = Field(default_factory=dict)
    stats: Dict[str, Any] = Field(default_factory=dict)
    assets: List[str] = Field(default_factory=list)  # Asset IDs
    dialogue_lines: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Weapon(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    weapon_type: WeaponType
    lore: str
    damage_profile: Dict[str, int] = Field(default_factory=dict)  # {"physical": 50, "spirit": 30}
    combo_path: List[str] = Field(default_factory=list)  # ["light", "heavy", "ability"]
    upgrade_tree: Dict[str, Dict[str, Any]] = Field(default_factory=dict)
    vfx_sfx_notes: str = ""
    accessibility_notes: str = ""
    assets: List[str] = Field(default_factory=list)  # Asset IDs
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Quest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    realm: RealmType
    quest_type: str  # "main", "side", "puzzle", "combat"
    objectives: List[str] = Field(default_factory=list)
    rewards: Dict[str, Any] = Field(default_factory=dict)
    required_level: int = 1
    estimated_duration: str = ""  # "30 minutes"
    npcs_involved: List[str] = Field(default_factory=list)  # Character IDs
    assets: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MusicTrack(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    realm: RealmType
    mood: str  # "exploration", "combat", "meditation"
    tempo: int
    key: str
    instrumentation: List[str] = Field(default_factory=list)
    transition_rules: str = ""
    intensity_layers: Dict[str, str] = Field(default_factory=dict)
    asset_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Create Models
class DocumentCreate(BaseModel):
    title: str
    document_type: DocumentType
    content: Dict[str, Any] = Field(default_factory=dict)
    tags: List[str] = Field(default_factory=list)

class CharacterCreate(BaseModel):
    name: str
    description: str
    realm: RealmType
    character_type: str
    emotions: Dict[EmotionState, str] = Field(default_factory=dict)
    stats: Dict[str, Any] = Field(default_factory=dict)

class WeaponCreate(BaseModel):
    name: str
    weapon_type: WeaponType
    lore: str
    damage_profile: Dict[str, int] = Field(default_factory=dict)
    combo_path: List[str] = Field(default_factory=list)

class QuestCreate(BaseModel):
    title: str
    description: str
    realm: RealmType
    quest_type: str
    objectives: List[str] = Field(default_factory=list)

class MusicTrackCreate(BaseModel):
    name: str
    realm: RealmType
    mood: str
    tempo: int
    key: str
    instrumentation: List[str] = Field(default_factory=list)

# API Routes

# Document Management
@api_router.post("/documents", response_model=BaseDocument)
async def create_document(document: DocumentCreate):
    doc_dict = document.dict()
    doc_obj = BaseDocument(**doc_dict)
    await db.documents.insert_one(doc_obj.dict())
    return doc_obj

@api_router.get("/documents", response_model=List[BaseDocument])
async def get_documents(document_type: Optional[DocumentType] = None, limit: int = 100):
    filter_dict = {}
    if document_type:
        filter_dict["document_type"] = document_type
    
    documents = await db.documents.find(filter_dict).limit(limit).to_list(limit)
    return [BaseDocument(**doc) for doc in documents]

@api_router.get("/documents/{document_id}", response_model=BaseDocument)
async def get_document(document_id: str):
    document = await db.documents.find_one({"id": document_id})
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return BaseDocument(**document)

@api_router.put("/documents/{document_id}", response_model=BaseDocument)
async def update_document(document_id: str, updates: Dict[str, Any]):
    updates["updated_at"] = datetime.utcnow()
    
    existing = await db.documents.find_one({"id": document_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Increment version
    updates["version"] = existing.get("version", 1) + 1
    
    await db.documents.update_one({"id": document_id}, {"$set": updates})
    updated_doc = await db.documents.find_one({"id": document_id})
    return BaseDocument(**updated_doc)

# Character Management
@api_router.post("/characters", response_model=Character)
async def create_character(character: CharacterCreate):
    char_dict = character.dict()
    char_obj = Character(**char_dict)
    await db.characters.insert_one(char_obj.dict())
    return char_obj

@api_router.get("/characters", response_model=List[Character])
async def get_characters(realm: Optional[RealmType] = None, character_type: Optional[str] = None):
    filter_dict = {}
    if realm:
        filter_dict["realm"] = realm
    if character_type:
        filter_dict["character_type"] = character_type
    
    characters = await db.characters.find(filter_dict).to_list(100)
    return [Character(**char) for char in characters]

@api_router.get("/characters/{character_id}", response_model=Character)
async def get_character(character_id: str):
    character = await db.characters.find_one({"id": character_id})
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    return Character(**character)

# Weapon Management
@api_router.post("/weapons", response_model=Weapon)
async def create_weapon(weapon: WeaponCreate):
    weapon_dict = weapon.dict()
    weapon_obj = Weapon(**weapon_dict)
    await db.weapons.insert_one(weapon_obj.dict())
    return weapon_obj

@api_router.get("/weapons", response_model=List[Weapon])
async def get_weapons(weapon_type: Optional[WeaponType] = None):
    filter_dict = {}
    if weapon_type:
        filter_dict["weapon_type"] = weapon_type
    
    weapons = await db.weapons.find(filter_dict).to_list(100)
    return [Weapon(**weapon) for weapon in weapons]

# Quest Management
@api_router.post("/quests", response_model=Quest)
async def create_quest(quest: QuestCreate):
    quest_dict = quest.dict()
    quest_obj = Quest(**quest_dict)
    await db.quests.insert_one(quest_obj.dict())
    return quest_obj

@api_router.get("/quests", response_model=List[Quest])
async def get_quests(realm: Optional[RealmType] = None, quest_type: Optional[str] = None):
    filter_dict = {}
    if realm:
        filter_dict["realm"] = realm
    if quest_type:
        filter_dict["quest_type"] = quest_type
    
    quests = await db.quests.find(filter_dict).to_list(100)
    return [Quest(**quest) for quest in quests]

# Music Management
@api_router.post("/music", response_model=MusicTrack)
async def create_music_track(track: MusicTrackCreate):
    track_dict = track.dict()
    track_obj = MusicTrack(**track_dict)
    await db.music_tracks.insert_one(track_obj.dict())
    return track_obj

@api_router.get("/music", response_model=List[MusicTrack])
async def get_music_tracks(realm: Optional[RealmType] = None, mood: Optional[str] = None):
    filter_dict = {}
    if realm:
        filter_dict["realm"] = realm
    if mood:
        filter_dict["mood"] = mood
    
    tracks = await db.music_tracks.find(filter_dict).to_list(100)
    return [MusicTrack(**track) for track in tracks]

# Asset Management
@api_router.post("/assets", response_model=Asset)
async def upload_asset(
    file: UploadFile = File(...),
    name: str = Form(...),
    category: str = Form(...),
    description: Optional[str] = Form(None),
    tags: str = Form("[]")
):
    # Create uploads directory if it doesn't exist
    uploads_dir = Path("uploads")
    uploads_dir.mkdir(exist_ok=True)
    
    # Save file
    file_path = uploads_dir / f"{uuid.uuid4()}_{file.filename}"
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Parse tags
    tags_list = json.loads(tags) if tags else []
    
    # Create asset record
    asset_obj = Asset(
        name=name,
        file_path=str(file_path),
        file_type=file.content_type or "unknown",
        category=category,
        description=description,
        tags=tags_list
    )
    
    await db.assets.insert_one(asset_obj.dict())
    return asset_obj

@api_router.get("/assets", response_model=List[Asset])
async def get_assets(category: Optional[str] = None):
    filter_dict = {}
    if category:
        filter_dict["category"] = category
    
    assets = await db.assets.find(filter_dict).to_list(100)
    return [Asset(**asset) for asset in assets]

# Dashboard Stats
@api_router.get("/dashboard/stats")
async def get_dashboard_stats():
    stats = {
        "documents": await db.documents.count_documents({}),
        "characters": await db.characters.count_documents({}),
        "weapons": await db.weapons.count_documents({}),
        "quests": await db.quests.count_documents({}),
        "music_tracks": await db.music_tracks.count_documents({}),
        "assets": await db.assets.count_documents({})
    }
    return stats

# Search across all content
@api_router.get("/search")
async def search_content(query: str, limit: int = 50):
    results = {
        "documents": [],
        "characters": [],
        "weapons": [],
        "quests": [],
        "music": []
    }
    
    # Search documents
    docs = await db.documents.find({
        "$or": [
            {"title": {"$regex": query, "$options": "i"}},
            {"tags": {"$regex": query, "$options": "i"}}
        ]
    }).limit(limit).to_list(limit)
    results["documents"] = [BaseDocument(**doc) for doc in docs]
    
    # Search characters  
    chars = await db.characters.find({
        "$or": [
            {"name": {"$regex": query, "$options": "i"}},
            {"description": {"$regex": query, "$options": "i"}}
        ]
    }).limit(limit).to_list(limit)
    results["characters"] = [Character(**char) for char in chars]
    
    # Search weapons
    weapons = await db.weapons.find({
        "$or": [
            {"name": {"$regex": query, "$options": "i"}},
            {"lore": {"$regex": query, "$options": "i"}}
        ]
    }).limit(limit).to_list(limit)
    results["weapons"] = [Weapon(**weapon) for weapon in weapons]
    
    # Search quests
    quests = await db.quests.find({
        "$or": [
            {"title": {"$regex": query, "$options": "i"}},
            {"description": {"$regex": query, "$options": "i"}}
        ]
    }).limit(limit).to_list(limit)
    results["quests"] = [Quest(**quest) for quest in quests]
    
    # Search music
    music = await db.music_tracks.find({
        "name": {"$regex": query, "$options": "i"}
    }).limit(limit).to_list(limit)
    results["music"] = [MusicTrack(**track) for track in music]
    
    return results

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "MythRealms GDD & Content Management Platform API"}

# Include router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()