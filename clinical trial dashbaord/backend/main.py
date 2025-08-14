#!/usr/bin/env python3
"""
Interactive Trial Explorer Backend
FastAPI server for clinical trials dashboard
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import route modules
from routes import analytics, trials, trends, scores, network, insights

app = FastAPI(title="Clinical Trial Explorer API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analytics.router)
app.include_router(trials.router)
app.include_router(trends.router)
app.include_router(scores.router)
app.include_router(network.router)
app.include_router(insights.router)

@app.get("/")
async def root():
    return {"message": "Clinical Trial Explorer API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 