from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websockets import manager

router = APIRouter()

@router.websocket("/ws/doctor/{doctor_id}")
async def doctor_websocket(websocket: WebSocket, doctor_id: int):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message(
                f"Doctor {doctor_id}: {data}", websocket
            )
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@router.websocket("/ws/patient/{patient_id}")
async def patient_websocket(websocket: WebSocket, patient_id: int):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message(
                f"Patient {patient_id}: {data}", websocket
            )
    except WebSocketDisconnect:
        manager.disconnect(websocket)