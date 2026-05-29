from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.return_request import (
    ReturnCreate,
    ReturnOut
)

from app.crud.return_request import (
    create_return_request,
    get_user_returns,
    update_return_status
)

from app.auth.oauth import get_current_user

from app.dependencies.role_checker import admin_required


router = APIRouter(

    prefix="/returns",

    tags=["Returns"]
)


# Create Return Request

@router.post(
    "/",
    response_model=ReturnOut
)
def create_return(

    data: ReturnCreate,

    db: Session = Depends(get_db),

    current_user = Depends(get_current_user)
):

    return create_return_request(

        db,

        current_user.id,

        data
    )


# Get User Returns

@router.get(
    "/my-returns",
    response_model=list[ReturnOut]
)
def get_returns(

    db: Session = Depends(get_db),

    current_user = Depends(get_current_user)
):

    return get_user_returns(

        db,

        current_user.id
    )


# Admin Update Return Status

@router.put("/{return_id}/status")
def update_status(

    return_id: int,

    status: str,

    db: Session = Depends(get_db),

    current_user = Depends(admin_required)
):

    updated_return = update_return_status(

        db,

        return_id,

        status
    )

    if not updated_return:

        raise HTTPException(

            status_code=404,

            detail="Return request not found"
        )

    return {
        "message": "Return status updated",
        "status": updated_return.status
    }