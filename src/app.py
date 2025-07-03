"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, Blueprint, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from api.utils import APIException, generate_sitemap
from api.models import db, User
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands

from dotenv import load_dotenv
load_dotenv()

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../public/')

app = Flask(__name__)
app.url_map.strict_slashes = False


db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-string-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False  
jwt = JWTManager(app)


if ENV == "development":
    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173", 
                "http://localhost:5174", 
                "http://localhost:3000",  
                "http://127.0.0.1:5173",
                "http://127.0.0.1:3000"
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })
else:
   
    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "https://tu-frontend-domain.onrender.com",  
                "https://tu-dominio.com"
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })


MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

setup_admin(app)
setup_commands(app)

app.register_blueprint(api, url_prefix='/api')


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

@app.errorhandler(404)
def not_found(error):
    return jsonify({"msg": "Endpoint no encontrado"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"msg": "Error interno del servidor"}), 500


@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return jsonify({
        "message": "Onix 2.0 E-commerce API",
        "version": "2.0",
        "status": "running",
        "endpoints": {
            "auth": "/api/login, /api/register",
            "products": "/api/products",
            "cart": "/api/cart",
            "orders": "/api/orders",
            "profile": "/api/profile"
        }
    })


@app.route('/api/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "message": "Onix 2.0 API is running",
        "environment": ENV,
        "database": "connected" if db else "error"
    }), 200


@jwt.user_identity_loader
def user_identity_lookup(user):
    return user

@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    identity = jwt_data["sub"]
    return User.query.filter_by(id=identity).one_or_none()


@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({"msg": "Token ha expirado"}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({"msg": "Token inválido"}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({"msg": "Token de autorización requerido"}), 401


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    if ENV == "production":
        if path != "" and os.path.exists(os.path.join(static_file_dir, path)):
            return send_from_directory(static_file_dir, path)
        else:
            return send_from_directory(static_file_dir, 'index.html')
    else:
      
        return generate_sitemap(app)


@app.before_request
def log_request_info():
    if ENV == "development":
        print(f"Request: {request.method} {request.url}")
        if request.is_json:
            print(f"Body: {request.get_json()}")

@app.after_request
def after_request(response):
    if ENV == "development":
        print(f"Response: {response.status_code}")
    return response

if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=(ENV == "development"))