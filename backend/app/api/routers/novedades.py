from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
import os
import shutil
import uuid
from app import models
from app.api.deps import get_db, get_current_admin
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/novedades", tags=["novedades"])

class NovedadCreate(BaseModel):
    titulo: str
    descripcion: str
    url: Optional[str] = None
    url_imagen_empresa: Optional[str] = None
    empresa: Optional[str] = None
    url_imagen_principal: Optional[str] = None

class NovedadUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    url: Optional[str] = None
    url_imagen_empresa: Optional[str] = None
    empresa: Optional[str] = None
    url_imagen_principal: Optional[str] = None

@router.get("/")
def get_novedades(db: Session = Depends(get_db)):
    """Public endpoint to fetch all novedades for landing page"""
    novedades = db.query(models.Novedad).order_by(models.Novedad.fecha_creacion.desc()).all()
    return novedades

@router.post("/upload-image")
async def upload_novedad_image(
    file: UploadFile = File(...),
    current_admin: models.User = Depends(get_current_admin)
):
    """Admin endpoint to upload an image and get its URL"""
    if file.content_type not in ["image/jpeg", "image/png", "image/webp", "image/svg+xml"]:
        raise HTTPException(status_code=400, detail="Solo se permiten imagenes JPG, PNG, WEBP y SVG")
    
    contents = await file.read()
    MAX_SIZE = 100 * 1024 * 1024  # 100 MB
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="La imagen no debe superar los 100 MB.")
    
    file_ext = os.path.splitext(file.filename)[1]
    if not file_ext:
        ext_map = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/svg+xml": ".svg"}
        file_ext = ext_map.get(file.content_type, ".jpg")
    
    filename = f"novedad_{uuid.uuid4()}{file_ext}"
    file_path = f"static/uploads/{filename}"
    
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar la imagen: {str(e)}")
    
    image_url = f"/api/static/uploads/{filename}"
    return {"url": image_url}

@router.post("/")
def create_novedad(
    novedad: NovedadCreate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    """Admin endpoint to create a novedad"""
    new_novedad = models.Novedad(**novedad.dict())
    db.add(new_novedad)
    db.commit()
    db.refresh(new_novedad)
    return new_novedad

@router.put("/{novedad_id}")
def update_novedad(
    novedad_id: int,
    novedad: NovedadUpdate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    """Admin endpoint to update a novedad"""
    db_novedad = db.query(models.Novedad).filter(models.Novedad.id == novedad_id).first()
    if not db_novedad:
        raise HTTPException(status_code=404, detail="Novedad not found")
    
    update_data = novedad.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_novedad, key, value)
        
    db.commit()
    db.refresh(db_novedad)
    return db_novedad

@router.delete("/{novedad_id}")
def delete_novedad(
    novedad_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    """Admin endpoint to delete a novedad"""
    db_novedad = db.query(models.Novedad).filter(models.Novedad.id == novedad_id).first()
    if not db_novedad:
        raise HTTPException(status_code=404, detail="Novedad not found")
        
    db.delete(db_novedad)
    db.commit()
    return {"message": "Novedad deleted successfully"}
