from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime
import enum
import uuid

db = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    avatar_url = db.Column(db.Text, nullable=True)
    role = db.Column(db.String(20), nullable=False, default='customer')
    email_verified = db.Column(db.Boolean, nullable=False, default=False)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    address = db.Column(db.Text, nullable=True)
    city = db.Column(db.String(100), nullable=True)
    postal_code = db.Column(db.String(20), nullable=True)
    country = db.Column(db.String(100), nullable=False, default='España')
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    cart_items = db.relationship('CartItem', backref='user', lazy=True, cascade='all, delete-orphan')
    orders = db.relationship('Order', backref='user', lazy=True)

    def __repr__(self):
        return f'<User {self.email}>'

    def serialize(self):
        return {
            "id": str(self.id),
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "phone": self.phone,
            "avatar_url": self.avatar_url,
            "role": self.role,
            "email_verified": self.email_verified,
            "is_active": self.is_active,
            "address": self.address,
            "city": self.city,
            "postal_code": self.postal_code,
            "country": self.country,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.Text, nullable=True)
    parent_id = db.Column(UUID(as_uuid=True), db.ForeignKey('categories.id'), nullable=True)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    sort_order = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    products = db.relationship('Product', backref='category', lazy=True)

    def __repr__(self):
        return f'<Category {self.name}>'

    def serialize(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "slug": self.slug,
            "description": self.description,
            "image_url": self.image_url,
            "parent_id": str(self.parent_id) if self.parent_id else None,
            "is_active": self.is_active,
            "sort_order": self.sort_order
        }

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(255), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    short_description = db.Column(db.Text, nullable=True)
    sku = db.Column(db.String(100), unique=True, nullable=True)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    compare_price = db.Column(db.Numeric(10, 2), nullable=True)
    cost_price = db.Column(db.Numeric(10, 2), nullable=True)
    track_inventory = db.Column(db.Boolean, nullable=False, default=True)
    stock_quantity = db.Column(db.Integer, nullable=False, default=0)
    low_stock_threshold = db.Column(db.Integer, nullable=False, default=5)
    weight = db.Column(db.Numeric(8, 2), nullable=True)
    dimensions_length = db.Column(db.Numeric(8, 2), nullable=True)
    dimensions_width = db.Column(db.Numeric(8, 2), nullable=True)
    dimensions_height = db.Column(db.Numeric(8, 2), nullable=True)
    image_url = db.Column(db.Text, nullable=True)
    gallery_images = db.Column(JSONB, nullable=False, default=list)
    category_id = db.Column(UUID(as_uuid=True), db.ForeignKey('categories.id'), nullable=True)
    vendor_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=True)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    is_featured = db.Column(db.Boolean, nullable=False, default=False)
    meta_title = db.Column(db.String(255), nullable=True)
    meta_description = db.Column(db.Text, nullable=True)
    tags = db.Column(db.ARRAY(db.Text), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    cart_items = db.relationship('CartItem', backref='product', lazy=True)
    order_items = db.relationship('OrderItem', backref='product', lazy=True)
    variants = db.relationship('ProductVariant', backref='product', lazy=True, cascade='all, delete-orphan')
    vendor = db.relationship('User', backref='products', foreign_keys=[vendor_id])

    def __repr__(self):
        return f'<Product {self.name}>'

    def serialize(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "slug": self.slug,
            "description": self.description,
            "short_description": self.short_description,
            "sku": self.sku,
            "price": float(self.price) if self.price else None,
            "compare_price": float(self.compare_price) if self.compare_price else None,
            "stock_quantity": self.stock_quantity,
            "image_url": self.image_url,
            "gallery_images": self.gallery_images,
            "category_id": str(self.category_id) if self.category_id else None,
            "vendor_id": str(self.vendor_id) if self.vendor_id else None,
            "is_active": self.is_active,
            "is_featured": self.is_featured,
            "tags": self.tags,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class CartItem(db.Model):
    __tablename__ = 'cart_items'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(UUID(as_uuid=True), db.ForeignKey('products.id'), nullable=False)
    product_variant_id = db.Column(UUID(as_uuid=True), db.ForeignKey('product_variants.id'), nullable=True)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<CartItem {self.user_id}-{self.product_id}>'

    def serialize(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "product_id": str(self.product_id),
            "product_variant_id": str(self.product_variant_id) if self.product_variant_id else None,
            "product": self.product.serialize() if self.product else None,
            "quantity": self.quantity,
            "price": float(self.price) if self.price else None,
            "subtotal": float(self.price * self.quantity) if self.price else 0,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class ProductVariant(db.Model):
    __tablename__ = 'product_variants'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = db.Column(UUID(as_uuid=True), db.ForeignKey('products.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    sku = db.Column(db.String(100), unique=True, nullable=True)
    price = db.Column(db.Numeric(10, 2), nullable=True)
    stock_quantity = db.Column(db.Integer, nullable=False, default=0)
    attributes = db.Column(JSONB, nullable=False, default=dict)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    cart_items = db.relationship('CartItem', backref='product_variant', lazy=True)
    order_items = db.relationship('OrderItem', backref='product_variant', lazy=True)

    def __repr__(self):
        return f'<ProductVariant {self.name}>'

    def serialize(self):
        return {
            "id": str(self.id),
            "product_id": str(self.product_id),
            "name": self.name,
            "sku": self.sku,
            "price": float(self.price) if self.price else None,
            "stock_quantity": self.stock_quantity,
            "attributes": self.attributes,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class OrderStatusEnum(enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class PaymentStatusEnum(enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_number = db.Column(db.String(50), unique=True, nullable=False)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.Enum(OrderStatusEnum), nullable=False, default=OrderStatusEnum.PENDING)
    payment_status = db.Column(db.Enum(PaymentStatusEnum), nullable=False, default=PaymentStatusEnum.PENDING)
    payment_method = db.Column(db.String(50), nullable=True)
    payment_intent_id = db.Column(db.String(255), nullable=True)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    tax_amount = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    shipping_amount = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    discount_amount = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    shipping_address = db.Column(JSONB, nullable=False)
    billing_address = db.Column(JSONB, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    tracking_number = db.Column(db.String(100), nullable=True)
    shipped_at = db.Column(db.DateTime(timezone=True), nullable=True)
    delivered_at = db.Column(db.DateTime(timezone=True), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    order_items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Order {self.order_number}>'

    def serialize(self):
        return {
            "id": str(self.id),
            "order_number": self.order_number,
            "user_id": str(self.user_id),
            "status": self.status.value if self.status else None,
            "payment_status": self.payment_status.value if self.payment_status else None,
            "payment_method": self.payment_method,
            "payment_intent_id": self.payment_intent_id,
            "subtotal": float(self.subtotal) if self.subtotal else None,
            "tax_amount": float(self.tax_amount) if self.tax_amount else None,
            "shipping_amount": float(self.shipping_amount) if self.shipping_amount else None,
            "discount_amount": float(self.discount_amount) if self.discount_amount else None,
            "total_amount": float(self.total_amount) if self.total_amount else None,
            "shipping_address": self.shipping_address,
            "billing_address": self.billing_address,
            "notes": self.notes,
            "tracking_number": self.tracking_number,
            "order_items": [item.serialize() for item in self.order_items],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = db.Column(UUID(as_uuid=True), db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(UUID(as_uuid=True), db.ForeignKey('products.id'), nullable=False)
    product_variant_id = db.Column(UUID(as_uuid=True), db.ForeignKey('product_variants.id'), nullable=True)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    total = db.Column(db.Numeric(10, 2), nullable=False)
    product_snapshot = db.Column(JSONB, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)

    def __repr__(self):
        return f'<OrderItem {self.order_id}-{self.product_id}>'

    def serialize(self):
        return {
            "id": str(self.id),
            "order_id": str(self.order_id),
            "product_id": str(self.product_id),
            "product_variant_id": str(self.product_variant_id) if self.product_variant_id else None,
            "product": self.product.serialize() if self.product else None,
            "quantity": self.quantity,
            "price": float(self.price) if self.price else None,
            "total": float(self.total) if self.total else None,
            "product_snapshot": self.product_snapshot
        }