from prometheus_client import start_http_server, Gauge
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from custom_websockets.endpoints.send_chat_message import router as chat_router

start_http_server(8003) # Metrics available at http://localhost:8003/metrics

APP_INFO = Gauge(
    'app_info', 
    'Application metadata',
    ['version', 'service']
).labels(version='1.0', service='producer')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def track_metrics(request: Request, call_next):
    response = await call_next(request)
    return response

app.include_router(chat_router)