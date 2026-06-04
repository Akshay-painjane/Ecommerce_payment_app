import razorpay

from app.config import settings


client = razorpay.Client(
    auth=(
        settings.RAZORPAY_KEY_ID,
        settings.RAZORPAY_KEY_SECRET
    )
)


def create_razorpay_order(
    amount: float
):

    payment = client.order.create({

        "amount": int(amount * 100),

        "currency": "INR",

        "payment_capture": 1
    })

    return payment


def verify_payment_signature(
    payment_data: dict
):

    return client.utility.verify_payment_signature(payment_data)