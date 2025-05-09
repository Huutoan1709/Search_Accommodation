from twilio.rest import Client
from django.conf import settings

def format_phone_number_for_twilio(phone_number):
    """Format Vietnamese phone numbers for Twilio"""
    # Remove any non-digit characters
    cleaned_number = ''.join(filter(str.isdigit, phone_number))
    
    # Handle Vietnamese phone numbers
    if cleaned_number.startswith('0'): # Remove leading 0
        cleaned_number = cleaned_number[1:]
    elif cleaned_number.startswith('84'): # Remove country code if present
        cleaned_number = cleaned_number[2:]
        
    # Add proper international format
    formatted_number = f'+84{cleaned_number}'
    
    return formatted_number

def send_sms(phone_number, message):
    """Send SMS using Twilio with proper phone number formatting"""
    try:
        # Format the phone number
        formatted_phone = format_phone_number_for_twilio(phone_number)
        
        # Initialize Twilio client
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        
        # Send message
        message = client.messages.create(
            body=message,
            from_=settings.TWILIO_PHONE_NUMBER,
            to=formatted_phone
        )
        
        return True
    except Exception as e:
        print(f"Error sending SMS: {str(e)}")
        return False