-- AdotaPerto: 3 animais e 3 itens completos com fotografias externas.
-- Idempotente: registros com o mesmo id são atualizados.
-- Requer pelo menos um usuário cadastrado.

WITH owner AS (
  SELECT id FROM "user" ORDER BY created_at ASC, id ASC LIMIT 1
)
INSERT INTO animal (
  id, name, species, sex, age, size, breed, weight, neutered, vaccination,
  dewormed, has_health_condition, health_condition, energy_level,
  lives_with_dogs, lives_with_cats, lives_with_children, personality,
  behavior_notes, adoption_reason, time_in_care, currently_in_care,
  description, image, images, traits, status, user_id, created_at, updated_at
)
SELECT
  entry.id, entry.name, entry.species, entry.sex, entry.age, entry.size,
  entry.breed, entry.weight, entry.neutered, entry.vaccination,
  entry.dewormed, entry.has_health_condition, entry.health_condition,
  entry.energy_level, entry.lives_with_dogs, entry.lives_with_cats,
  entry.lives_with_children, entry.personality, entry.behavior_notes,
  entry.adoption_reason, entry.time_in_care, entry.currently_in_care,
  entry.description, entry.image, entry.images, entry.traits,
  'Disponível', owner.id, NOW(), NOW()
FROM owner
CROSS JOIN (VALUES
  (
    'insert-bento', 'Bento', 'Cachorro', 'Macho', '2 anos', 'M', 'SRD', '16 kg',
    'Sim', 'Vacinas em dia, incluindo antirrábica', 'Sim', false,
    'Nenhuma condição de saúde conhecida', 'Alto', 'Sim', 'Não sei', 'Sim',
    'Alegre, sociável e muito apegado às pessoas',
    'Caminha bem com guia e responde a comandos básicos. Precisa de passeios diários para gastar energia.',
    'Foi resgatado próximo a uma rodovia e está em lar temporário desde então.',
    '4 meses', true,
    'Bento é um cão jovem, carinhoso e brincalhão. Procura uma família ativa, com tempo para passeios e adaptação responsável.',
    'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1400',
    ARRAY['https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=1400','https://images.pexels.com/photos/2607544/pexels-photo-2607544.jpeg?auto=compress&cs=tinysrgb&w=1400'],
    ARRAY['Sociável','Brincalhão','Vacinado']
  ),
  (
    'insert-amora', 'Amora', 'Gato', 'Fêmea', '1 ano e 4 meses', 'P', 'SRD', '3,8 kg',
    'Sim', 'Vacinas em dia', 'Sim', false,
    'Nenhuma condição de saúde conhecida', 'Moderado', 'Não sei', 'Sim', 'Sim',
    'Tranquila, curiosa e muito carinhosa',
    'Usa a caixa de areia e gosta de locais altos. A adaptação deve ser feita em ambiente telado e seguro.',
    'A antiga responsável precisou mudar para um local que não aceita animais.',
    '3 meses', true,
    'Amora é uma gata dócil que adora carinho e observar a casa pela janela. Será entregue somente para um lar sem acesso à rua.',
    'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=1400',
    ARRAY['https://images.pexels.com/photos/127028/pexels-photo-127028.jpeg?auto=compress&cs=tinysrgb&w=1400','https://images.pexels.com/photos/617278/pexels-photo-617278.jpeg?auto=compress&cs=tinysrgb&w=1400'],
    ARRAY['Castrada','Dócil','Usa caixa de areia']
  ),
  (
    'insert-simba', 'Simba', 'Cachorro', 'Macho', '5 anos', 'G', 'Labrador mestiço', '29 kg',
    'Sim', 'Vacinas em dia', 'Sim', false,
    'Possui sensibilidade alimentar controlada com ração adequada', 'Moderado', 'Sim', 'Não', 'Sim',
    'Companheiro, obediente e calmo dentro de casa',
    'É educado, não sobe em móveis e prefere passeios tranquilos. Não deve conviver com gatos.',
    'A família atual não consegue mais oferecer o espaço e os cuidados necessários.',
    '5 anos', true,
    'Simba é um cão adulto equilibrado e muito companheiro. Procura uma família que mantenha sua alimentação e rotina de passeios.',
    'https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg?auto=compress&cs=tinysrgb&w=1400',
    ARRAY['https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg?auto=compress&cs=tinysrgb&w=1400','https://images.pexels.com/photos/1490908/pexels-photo-1490908.jpeg?auto=compress&cs=tinysrgb&w=1400'],
    ARRAY['Castrado','Calmo','Companheiro']
  )
) AS entry(
  id, name, species, sex, age, size, breed, weight, neutered, vaccination,
  dewormed, has_health_condition, health_condition, energy_level,
  lives_with_dogs, lives_with_cats, lives_with_children, personality,
  behavior_notes, adoption_reason, time_in_care, currently_in_care,
  description, image, images, traits
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, species = EXCLUDED.species, sex = EXCLUDED.sex,
  age = EXCLUDED.age, size = EXCLUDED.size, breed = EXCLUDED.breed,
  weight = EXCLUDED.weight, neutered = EXCLUDED.neutered,
  vaccination = EXCLUDED.vaccination, dewormed = EXCLUDED.dewormed,
  has_health_condition = EXCLUDED.has_health_condition,
  health_condition = EXCLUDED.health_condition, energy_level = EXCLUDED.energy_level,
  lives_with_dogs = EXCLUDED.lives_with_dogs, lives_with_cats = EXCLUDED.lives_with_cats,
  lives_with_children = EXCLUDED.lives_with_children, personality = EXCLUDED.personality,
  behavior_notes = EXCLUDED.behavior_notes, adoption_reason = EXCLUDED.adoption_reason,
  time_in_care = EXCLUDED.time_in_care, currently_in_care = EXCLUDED.currently_in_care,
  description = EXCLUDED.description, image = EXCLUDED.image, images = EXCLUDED.images,
  traits = EXCLUDED.traits, status = EXCLUDED.status, updated_at = NOW();

WITH owner AS (
  SELECT id FROM "user" ORDER BY created_at ASC, id ASC LIMIT 1
)
INSERT INTO donation_item (
  id, title, category, item_name, quantity, unit, condition, expiration_date,
  description, main_image, images, delivery_method, available_until, status,
  user_id, created_at, updated_at
)
SELECT
  entry.id, entry.title, entry.category, entry.item_name, entry.quantity,
  entry.unit, entry.condition, entry.expiration_date, entry.description,
  entry.main_image, entry.images, entry.delivery_method, entry.available_until,
  'Disponível', owner.id, NOW(), NOW()
FROM owner
CROSS JOIN (VALUES
  (
    'insert-racao-premium', 'Ração para cães adultos', 'Ração',
    'Ração seca premium sabor carne', 10, 'Kg', 'Lacrado', '2027-08-30',
    'Pacote lacrado de ração seca para cães adultos de porte médio e grande. Foi comprado por engano, está armazenado em local seco e dentro da validade.',
    'https://images.pexels.com/photos/6568944/pexels-photo-6568944.jpeg?auto=compress&cs=tinysrgb&w=1400',
    ARRAY['https://images.pexels.com/photos/6568501/pexels-photo-6568501.jpeg?auto=compress&cs=tinysrgb&w=1400','https://images.pexels.com/photos/7210748/pexels-photo-7210748.jpeg?auto=compress&cs=tinysrgb&w=1400'],
    'Retirada', '2027-07-31'
  ),
  (
    'insert-caminha-conforto', 'Caminha acolchoada tamanho médio', 'Caminhas e cobertores',
    'Caminha lavável para cães e gatos', 1, 'Unidade', 'Usado em boas condições', NULL,
    'Caminha higienizada, sem rasgos e com enchimento preservado. Mede aproximadamente 70 por 55 centímetros e atende cães de porte pequeno ou médio.',
    'https://images.pexels.com/photos/7310221/pexels-photo-7310221.jpeg?auto=compress&cs=tinysrgb&w=1400',
    ARRAY['https://images.pexels.com/photos/7310203/pexels-photo-7310203.jpeg?auto=compress&cs=tinysrgb&w=1400','https://images.pexels.com/photos/7310213/pexels-photo-7310213.jpeg?auto=compress&cs=tinysrgb&w=1400'],
    'A combinar', NULL
  ),
  (
    'insert-kit-brinquedos', 'Kit de brinquedos para cães', 'Brinquedos',
    'Bolinhas, corda e mordedores', 6, 'Unidade', 'Usado em boas condições', NULL,
    'Conjunto com duas bolinhas, uma corda e três mordedores. Todos os itens foram lavados, estão íntegros e são indicados para cães de porte pequeno e médio.',
    'https://images.pexels.com/photos/5502270/pexels-photo-5502270.jpeg?auto=compress&cs=tinysrgb&w=1400',
    ARRAY['https://images.pexels.com/photos/5502269/pexels-photo-5502269.jpeg?auto=compress&cs=tinysrgb&w=1400','https://images.pexels.com/photos/5502271/pexels-photo-5502271.jpeg?auto=compress&cs=tinysrgb&w=1400'],
    'Entrega', NULL
  )
) AS entry(
  id, title, category, item_name, quantity, unit, condition, expiration_date,
  description, main_image, images, delivery_method, available_until
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, category = EXCLUDED.category,
  item_name = EXCLUDED.item_name, quantity = EXCLUDED.quantity,
  unit = EXCLUDED.unit, condition = EXCLUDED.condition,
  expiration_date = EXCLUDED.expiration_date, description = EXCLUDED.description,
  main_image = EXCLUDED.main_image, images = EXCLUDED.images,
  delivery_method = EXCLUDED.delivery_method,
  available_until = EXCLUDED.available_until, status = EXCLUDED.status,
  updated_at = NOW();
