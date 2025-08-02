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
from dotenv import load_dotenv

load_dotenv()
ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../public/')
app = Flask(__name__)
app.url_map.strict_slashes = False
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    if db_url.startswith("postgres://"):
        app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace("postgres://", "postgresql://")
    else:
        app.config['SQLALCHEMY_DATABASE_URI'] = db_url
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-string-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False
cors_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "https://symmetrical-pancake-4jwgpgg74rv7c75xr-5173.app.github.dev",
    "https://effective-train-x5v9g99w6xpvh979g-3001.app.github.dev",
    "https://effective-train-x5v9g99w6xpvh979g-5173.app.github.dev"
]
CORS(app, resources={r"/api/*": {"origins": cors_origins}}, supports_credentials=True)
jwt = JWTManager(app)
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)
setup_admin(app)
app.register_blueprint(api, url_prefix='/api')
@jwt.user_identity_loader
def user_identity_lookup(user):
    return user.id if hasattr(user, 'id') else user
@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    identity = jwt_data["sub"]
    return User.query.filter_by(id=identity).one_or_none()
@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code
@app.errorhandler(404)
def not_found(error):
    return jsonify({"msg": "Endpoint no encontrado"}), 404
@app.errorhandler(500)
def internal_error(error):
    return jsonify({"msg": "Error interno del servidor"}), 500
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({"msg": "Token ha expirado"}), 401
@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({"msg": "Token inválido"}), 401
@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({"msg": "Token de autorización requerido"}), 401
@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return jsonify({
        "message": "Onix 2.0 E-commerce API",
        "version": "2.0",
        "status": "running",
        "database": "Railway PostgreSQL" if "railway" in app.config['SQLALCHEMY_DATABASE_URI'] else "Local",
        "endpoints": {
            "auth": "/api/login, /api/register",
            "products": "/api/products",
            "categories": "/api/categories",
            "cart": "/api/cart",
            "orders": "/api/orders",
            "profile": "/api/profile",
            "admin": "/api/admin/products"
        }
    })
@app.route('/api/health')
def health_check():
    try:
        with app.app_context():
            result = db.session.execute(db.text('SELECT 1;'))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    return jsonify({
        "status": "healthy",
        "message": "Onix 2.0 API is running",
        "environment": ENV,
        "database": db_status,
        "database_url": "Railway PostgreSQL" if "railway" in app.config['SQLALCHEMY_DATABASE_URI'] else "Local"
    }), 200
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
            body = request.get_json()
            if body and 'password' in body:
                safe_body = body.copy()
                safe_body['password'] = '***'
                print(f"Body: {safe_body}")
            else:
                print(f"Body: {body}")
@app.after_request
def after_request(response):
    if ENV == "development":
        print(f"Response: {response.status_code}")
    return response
def create_initial_data():
    try:
        from api.models import Category, User
        categories_data = [
            {'name': 'Anillos', 'description': 'Anillos de bisutería'},
            {'name': 'Collares', 'description': 'Collares y gargantillas'},
            {'name': 'Pulseras', 'description': 'Pulseras y brazaletes'},
            {'name': 'Pendientes', 'description': 'Aretes y pendientes'},
            {'name': 'Broches', 'description': 'Broches y alfileres'}
        ]
        for cat_data in categories_data:
            if not Category.query.filter_by(name=cat_data['name']).first():
                category = Category(name=cat_data['name'], description=cat_data['description'], is_active=True)
                db.session.add(category)
        admin = User.query.filter_by(email='admin@onix.com').first()
        if not admin:
            admin = User(email='admin@onix.com', first_name='Admin', last_name='Onix', phone='621327909', address='guillem', city='Pollensa', postal_code='07460', country='España', role='admin', is_active=True, email_verified=True)
            admin.set_password('admin123')
            db.session.add(admin)
        db.session.commit()
        print("✅ Datos iniciales verificados/creados")
    except Exception as e:
        print(f"⚠️  Error al crear datos iniciales: {e}")
@app.cli.command()
def init_db():
    print("🏗️  Creando tablas...")
    db.create_all()
    print("✅ Tablas creadas")
    print("📊 Creando datos iniciales...")
    create_initial_data()
    print("✅ Base de datos inicializada completamente")
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    if ENV == "development":
        with app.app_context():
            try:
                result = db.session.execute(db.text('SELECT 1 FROM users LIMIT 1;'))
                print("✅ Base de datos ya configurada")
            except:
                print("🏗️  Configurando base de datos por primera vez...")
                db.create_all()
                create_initial_data()
                print("✅ Base de datos configurada")
    print(f"🚀 Iniciando Onix 2.0 API en puerto {PORT}")
    print(f"🌍 Entorno: {ENV}")
    print(f"🗄️  Base de datos: {'Railway PostgreSQL' if 'railway' in app.config['SQLALCHEMY_DATABASE_URI'] else 'Local SQLite'}")
    app.run(host='0.0.0.0', port=PORT, debug=(ENV == "development"))
