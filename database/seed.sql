/*
  Cabañas Cordoba - Seed
  - 1 admin
  - 3 cabañas
  - 1 bloqueo de ejemplo

  Admin por defecto (DEV):
  - usuario: admin
  - password: admin123

  Hash:
  - pbkdf2 sha256
  - iters: 120000
  - salt (hex 16 bytes): 5a3d0c1f2e4b6a7988a7c6d5e4f3b201
  - hash (hex 32 bytes): 0cdad6d27a06bf038b7fe68c0945cb7a105252035ea1a4ccdf26dbd67bfe764c
*/

USE cabanas_cordoba;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE blocks;
TRUNCATE TABLE cabin_images;
TRUNCATE TABLE cabins;
TRUNCATE TABLE admins;
SET FOREIGN_KEY_CHECKS = 1;

-- Admin fijo (DEV)
INSERT INTO admins (id, username, password_salt, password_hash, password_iters)
VALUES
  (1, 'admin', '5a3d0c1f2e4b6a7988a7c6d5e4f3b201', '0cdad6d27a06bf038b7fe68c0945cb7a105252035ea1a4ccdf26dbd67bfe764c', 120000);

-- Cabañas (3)
INSERT INTO cabins
  (id, title, slug, short_description, description, city, province, price_per_night, max_guests, bedrooms, bathrooms, is_featured, is_active)
VALUES
  (
    1,
    'Cabaña del Lago',
    'cabana-del-lago',
    'A metros del agua, ideal para desconectar con vista abierta y fogón.',
    'Cabaña cálida y luminosa, con living-comedor, cocina equipada y galería. Perfecta para descansar y disfrutar de la naturaleza. Incluye parrilla y espacio para estacionar.',
    'Villa Carlos Paz',
    'Córdoba',
    65000.00,
    4,
    2,
    1,
    1,
    1
  ),
  (
    2,
    'Cabaña Bosque Serrano',
    'cabana-bosque-serrano',
    'Entre árboles y sierras, ambiente tranquilo para parejas o familia chica.',
    'Rodeada de verde, con deck exterior, cocina completa y dormitorio confortable. Un lugar pensado para el descanso, con acceso rápido a senderos y miradores.',
    'La Cumbrecita',
    'Córdoba',
    72000.00,
    3,
    1,
    1,
    1,
    1
  ),
  (
    3,
    'Cabaña Vista Panorámica',
    'cabana-vista-panoramica',
    'Altura y paisaje: amaneceres increíbles y aire puro serrano.',
    'Cabaña en zona alta con ventanales amplios. Ideal para quienes buscan tranquilidad y una vista abierta. Incluye parrilla, calefacción y cocina equipada.',
    'Mina Clavero',
    'Córdoba',
    80000.00,
    5,
    2,
    2,
    0,
    1
  );

-- Imágenes (picsum como placeholder estable)
INSERT INTO cabin_images (id, cabin_id, image_url, alt_text, sort_order)
VALUES
  (1, 1, 'https://picsum.photos/seed/cabana-lago-1/1200/800', 'Cabaña del Lago - exterior', 0),
  (2, 1, 'https://picsum.photos/seed/cabana-lago-2/1200/800', 'Cabaña del Lago - interior', 1),

  (3, 2, 'https://picsum.photos/seed/cabana-bosque-1/1200/800', 'Cabaña Bosque Serrano - exterior', 0),
  (4, 2, 'https://picsum.photos/seed/cabana-bosque-2/1200/800', 'Cabaña Bosque Serrano - interior', 1),

  (5, 3, 'https://picsum.photos/seed/cabana-vista-1/1200/800', 'Cabaña Vista Panorámica - vista', 0),
  (6, 3, 'https://picsum.photos/seed/cabana-vista-2/1200/800', 'Cabaña Vista Panorámica - interior', 1);

-- Bloqueo de ejemplo (mantenimiento)
-- Bloquea noches 2026-01-20, 2026-01-21, 2026-01-22 (to_date excluido)
INSERT INTO blocks (id, cabin_id, from_date, to_date, reason)
VALUES
  (1, 1, '2026-01-20', '2026-01-23', 'Mantenimiento general');
