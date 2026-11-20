"""
AI Assistant ('Rasoi Saathi') API Routes
"""

from flask import Blueprint, request, jsonify
from backend.ai_assistant import rasoi_saathi
from backend.auth import get_current_user

ai_bp = Blueprint('ai_bp', __name__)

@ai_bp.route('/chat', methods=['POST'])
def chat():
    data = request.get_json() or {}
    message = data.get('message', '').strip()

    if not message:
        return jsonify({
            'success': False,
            'reply': 'Ram Ram! 🙏 Kripya batayein main aapki kya sahayata kar sakta hoon?'
        })

    user = get_current_user()
    result = rasoi_saathi.process_message(message, session_user=user)
    return jsonify({
        'success': True,
        **result
    })
