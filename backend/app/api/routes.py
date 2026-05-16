from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    AnalysisResponse,
    AnalyzeRepositoryRequest,
    BlastRadiusResponse,
    GraphResponse,
    ModernizationResponse,
    QueryRequest,
    TechnicalDebtResponse,
    TraceResponse,
)
from app.services.analysis_service import AnalysisService

router = APIRouter()
analysis_service = AnalysisService()


@router.post("/repositories/analyze", response_model=AnalysisResponse)
def analyze_repository(payload: AnalyzeRepositoryRequest) -> AnalysisResponse:
    try:
        return analysis_service.analyze_repository(payload)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/graph", response_model=GraphResponse)
def get_graph() -> GraphResponse:
    return analysis_service.get_graph()


@router.post("/trace", response_model=TraceResponse)
def trace_flow(payload: QueryRequest) -> TraceResponse:
    return analysis_service.trace_flow(payload.query)


@router.get("/debt", response_model=TechnicalDebtResponse)
def get_debt() -> TechnicalDebtResponse:
    return analysis_service.get_technical_debt()


@router.get("/modernization", response_model=ModernizationResponse)
def get_modernization() -> ModernizationResponse:
    return analysis_service.get_modernization()


@router.get("/blast-radius/{node_id:path}", response_model=BlastRadiusResponse)
def compute_blast_radius(node_id: str) -> BlastRadiusResponse:
    return analysis_service.compute_blast_radius(node_id)

