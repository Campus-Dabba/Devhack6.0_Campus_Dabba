-- Campus Dabba: refresh seed data + security fixes
-- Run once in Supabase Dashboard -> SQL Editor (or `supabase db push`).
--
-- What it does
--   1. Wipes plaintext passwords from public.cooks / public.users (Supabase Auth
--      already stores the real hashed password; these columns were readable with
--      the public anon key).
--   2. Rewrites the 10 existing cook rows in place with realistic profiles.
--      IDs are kept, so the linked auth.users / public.users rows keep working.
--      These are demo profiles, not real people.
--   3. Replaces every dabba_menu row with a full Monday-Sunday menu per cook.
--      Menu rows referenced by past order_items are kept but hidden
--      (is_available = false) so order history is not broken.
--   4. Normalises the duplicated camelCase/snake_case cook columns.

begin;

-- 1. Plaintext passwords -----------------------------------------------------
update public.cooks set password = null where password is not null;
update public.users set password = null where password is not null;

-- 2. Cook profiles -----------------------------------------------------------
update public.cooks set
  first_name = 'Lakshmi Prasanna', last_name = 'Reddy', name = 'Lakshmi Prasanna Reddy',
  business_name = 'Lakshmi''s Andhra Bhojanam',
  description = 'Home cook from Vijayawada making proper Andhra meals for 15+ years. Pappu, a rotating curry, rasam, pickle and curd rice every day - spice level adjustable on request.',
  region = 'Andhra Pradesh', state = 'Andhra Pradesh', city = 'Vijayawada', pincode = '520010',
  address = '{"street": "12-4-31, Gandhi Nagar, Near Benz Circle", "city": "Vijayawada", "state": "Andhra Pradesh", "pincode": "520010"}'::jsonb,
  latitude = '16.5062', longitude = '80.648',
  cuisine_type = 'andhra', "cuisineType" = '"andhra"'::jsonb,
  specialties = ARRAY['Gongura Pachadi','Pesarattu','Andhra Meals']::text[],
  certification = '["FSSAI Registered"]'::jsonb,
  rating = 4.8, total_orders = 312, totalorders = 312,
  is_available = true, "isAvailable" = true,
  profile_image = null
where id = '317bf6f3-4697-451c-9ee7-a048c1ab2206';

update public.cooks set
  first_name = 'Shobha', last_name = 'Kulkarni', name = 'Shobha Kulkarni',
  business_name = 'Shobha''s Uttar Karnataka Oota',
  description = 'North Karnataka thalis from a Saptapur kitchen, five minutes from campus. Jolada rotti made fresh every morning, with ennegai, kaalu palya and Dharwad-style chutney pudi.',
  region = 'Karnataka', state = 'Karnataka', city = 'Dharwad', pincode = '580001',
  address = '{"street": "Saptapur, Near Karnatak University Gate", "city": "Dharwad", "state": "Karnataka", "pincode": "580001"}'::jsonb,
  latitude = '15.4589', longitude = '75.0078',
  cuisine_type = 'north karnataka', "cuisineType" = '"north karnataka"'::jsonb,
  specialties = ARRAY['Jolada Rotti','Ennegai','Dharwad Peda']::text[],
  certification = '["FSSAI Registered"]'::jsonb,
  rating = 4.9, total_orders = 268, totalorders = 268,
  is_available = true, "isAvailable" = true,
  profile_image = null
where id = 'b68695e7-1ca3-4064-8cf4-2910aa8e3cda';

update public.cooks set
  first_name = 'Bina', last_name = 'Barua', name = 'Bina Barua',
  business_name = 'Bina''s Axomiya Kitchen',
  description = 'Assamese home food in Chandmari - light, mustard-oil based and not too spicy. Masor tenga on weekends, khar and pitika thalis on weekdays.',
  region = 'Assam', state = 'Assam', city = 'Guwahati', pincode = '781003',
  address = '{"street": "House 7, Zoo Narengi Road, Chandmari", "city": "Guwahati", "state": "Assam", "pincode": "781003"}'::jsonb,
  latitude = '26.1825', longitude = '91.77',
  cuisine_type = 'assamese', "cuisineType" = '"assamese"'::jsonb,
  specialties = ARRAY['Masor Tenga','Aloo Pitika','Khar']::text[],
  certification = '["FSSAI Registered"]'::jsonb,
  rating = 4.7, total_orders = 146, totalorders = 146,
  is_available = true, "isAvailable" = true,
  profile_image = null
where id = 'aa12772a-4ee8-407f-a19f-2cbebe4fcf85';

update public.cooks set
  first_name = 'Ramesh', last_name = 'Nimbalkar', name = 'Ramesh Nimbalkar',
  business_name = 'Nimbalkar Gharguti Khanaval',
  description = 'Kolhapuri-style home food in Kothrud. Bhakri thalis on weekdays, tambda-pandhra rassa on Sundays. Cooking for students and working professionals since 2016.',
  region = 'Maharashtra', state = 'Maharashtra', city = 'Pune', pincode = '411038',
  address = '{"street": "Flat 4, Shivtirth Nagar, Paud Road, Kothrud", "city": "Pune", "state": "Maharashtra", "pincode": "411038"}'::jsonb,
  latitude = '18.5074', longitude = '73.8077',
  cuisine_type = 'maharashtrian', "cuisineType" = '"maharashtrian"'::jsonb,
  specialties = ARRAY['Tambda Rassa','Pandhra Rassa','Misal']::text[],
  certification = '["FSSAI Registered"]'::jsonb,
  rating = 4.6, total_orders = 221, totalorders = 221,
  is_available = true, "isAvailable" = true,
  profile_image = null
where id = '3d5f7b5e-efa9-4866-837f-8aca850b4f8a';

update public.cooks set
  first_name = 'Meenakshi', last_name = 'Iyer', name = 'Meenakshi Iyer',
  business_name = 'Meenakshi''s Tiffin',
  description = 'Palakkad-Tamil vegetarian food from Matunga. Sambar, rasam, kootu and poriyal rotated daily, with curd rice and homemade pickle. No onion-garlic option on Tuesdays.',
  region = 'Maharashtra', state = 'Maharashtra', city = 'Mumbai', pincode = '400019',
  address = '{"street": "2nd Floor, Shanti Kunj, Bhandarkar Road, Matunga", "city": "Mumbai", "state": "Maharashtra", "pincode": "400019"}'::jsonb,
  latitude = '19.0275', longitude = '72.857',
  cuisine_type = 'tamil', "cuisineType" = '"tamil"'::jsonb,
  specialties = ARRAY['Mor Kuzhambu','Avial','Curd Rice']::text[],
  certification = '["FSSAI Registered"]'::jsonb,
  rating = 4.8, total_orders = 289, totalorders = 289,
  is_available = true, "isAvailable" = true,
  profile_image = null
where id = '5205e060-5ee0-447d-bc4b-f20464ef58a4';

update public.cooks set
  first_name = 'Farida', last_name = 'Shaikh', name = 'Farida Shaikh',
  business_name = 'Farida''s Deccani Dastarkhwan',
  description = 'Deccani and Hyderabadi-style home food in Old Hubli. Dum biryani every Friday and Sunday, khichdi-khatta and kheema on weekdays. Halal.',
  region = 'Karnataka', state = 'Karnataka', city = 'Hubballi', pincode = '580024',
  address = '{"street": "Old Hubli, Near Idgah Maidan", "city": "Hubballi", "state": "Karnataka", "pincode": "580024"}'::jsonb,
  latitude = '15.3647', longitude = '75.124',
  cuisine_type = 'deccani', "cuisineType" = '"deccani"'::jsonb,
  specialties = ARRAY['Dum Biryani','Kheema','Double ka Meetha']::text[],
  certification = '["FSSAI Registered"]'::jsonb,
  rating = 4.7, total_orders = 194, totalorders = 194,
  is_available = true, "isAvailable" = true,
  profile_image = null
where id = 'efb6c8da-f7b8-4f9b-9b8e-34c0986edafa';

update public.cooks set
  first_name = 'Nabam', last_name = 'Tara', name = 'Nabam Tara',
  business_name = 'Nabam''s Hill Kitchen',
  description = 'Nyishi home cooking from Itanagar - smoked meats, bamboo shoot and lots of greens, boiled rather than fried. Thukpa and momos on weekends.',
  region = 'Arunachal Pradesh', state = 'Arunachal Pradesh', city = 'Itanagar', pincode = '791111',
  address = '{"street": "E-Sector, Near Ganga Market", "city": "Itanagar", "state": "Arunachal Pradesh", "pincode": "791111"}'::jsonb,
  latitude = '27.0844', longitude = '93.6053',
  cuisine_type = 'arunachali', "cuisineType" = '"arunachali"'::jsonb,
  specialties = ARRAY['Smoked Pork with Bamboo Shoot','Pika Pila','Thukpa']::text[],
  certification = '["FSSAI Registered"]'::jsonb,
  rating = 4.6, total_orders = 88, totalorders = 88,
  is_available = true, "isAvailable" = true,
  profile_image = null
where id = 'bb6c98f6-9c20-4358-bbfb-1f2929f7ffb9';

update public.cooks set
  first_name = 'Sunita', last_name = 'Deshpande', name = 'Sunita Deshpande',
  business_name = 'Deshpande Kaku''s Dabba',
  description = 'Puneri Brahmin vegetarian thali - poli, bhaji, aamti, bhaat and koshimbir, the way it''s made at home. Light on oil. Popular with COEP and FC students.',
  region = 'Maharashtra', state = 'Maharashtra', city = 'Pune', pincode = '411016',
  address = '{"street": "Model Colony, Near Deep Bungalow Chowk, Shivajinagar", "city": "Pune", "state": "Maharashtra", "pincode": "411016"}'::jsonb,
  latitude = '18.5308', longitude = '73.8375',
  cuisine_type = 'maharashtrian', "cuisineType" = '"maharashtrian"'::jsonb,
  specialties = ARRAY['Katachi Aamti','Puran Poli','Varan Bhaat']::text[],
  certification = '["FSSAI Registered"]'::jsonb,
  rating = 4.9, total_orders = 304, totalorders = 304,
  is_available = true, "isAvailable" = true,
  profile_image = null
where id = 'c9a51680-356b-4ab9-85f7-85e11a577e59';

update public.cooks set
  first_name = 'Ashok', last_name = 'Hiremath', name = 'Ashok Hiremath',
  business_name = 'Hiremath Khanavali',
  description = 'Lingayat khanavali-style vegetarian meals in Vidyagiri. Unlimited rotti on Sundays, Girmit and mirchi bajji in the evenings.',
  region = 'Karnataka', state = 'Karnataka', city = 'Dharwad', pincode = '580004',
  address = '{"street": "Vidyagiri, Near KCD Circle", "city": "Dharwad", "state": "Karnataka", "pincode": "580004"}'::jsonb,
  latitude = '15.44', longitude = '75.013',
  cuisine_type = 'north karnataka', "cuisineType" = '"north karnataka"'::jsonb,
  specialties = ARRAY['Khanavali Oota','Girmit','Badanekai Ennegai']::text[],
  certification = '["FSSAI Registered"]'::jsonb,
  rating = 4.5, total_orders = 173, totalorders = 173,
  is_available = true, "isAvailable" = true,
  profile_image = null
where id = '9dcf2a39-e599-4c03-9c75-a9290050fb21';

update public.cooks set
  first_name = 'Pema', last_name = 'Lepcha', name = 'Pema Lepcha',
  business_name = 'Pema''s Himalayan & Indo-Chinese',
  description = 'Originally from Kalimpong, cooking in Viman Nagar. Indo-Chinese weekday combos and Himalayan food on weekends - momos, thukpa, shaphaley.',
  region = 'Maharashtra', state = 'Maharashtra', city = 'Pune', pincode = '411014',
  address = '{"street": "Lane 6, Phoenix Road, Viman Nagar", "city": "Pune", "state": "Maharashtra", "pincode": "411014"}'::jsonb,
  latitude = '18.5679', longitude = '73.9143',
  cuisine_type = 'indo-chinese', "cuisineType" = '"indo-chinese"'::jsonb,
  specialties = ARRAY['Momos','Thukpa','Chilli Chicken']::text[],
  certification = '["FSSAI Registered"]'::jsonb,
  rating = 4.4, total_orders = 132, totalorders = 132,
  is_available = true, "isAvailable" = true,
  profile_image = null
where id = '8661924b-fafe-470c-852b-e9d0b11b2d05';

-- 3. Menus ------------------------------------------------------------------
-- Hide rows that past orders point at, delete everything else.
update public.dabba_menu set is_available = false
where id in (select menu_id from public.order_items where menu_id is not null
             union select menu_item_id from public.order_items where menu_item_id is not null);

delete from public.dabba_menu
where id not in (select menu_id from public.order_items where menu_id is not null
                 union select menu_item_id from public.order_items where menu_item_id is not null);

insert into public.dabba_menu
  (cook_id, item_name, name, description, price, meal_type, dietary_type, day_of_week, category, is_available, preparation_time)
values
  ('317bf6f3-4697-451c-9ee7-a048c1ab2206', 'Tomato Pappu', 'Tomato Pappu', 'Toor dal with tomato and garlic tadka', 45, 'lunch', 'veg', 'Monday', 'Andhra', true, 30),
  ('317bf6f3-4697-451c-9ee7-a048c1ab2206', 'Steamed Rice & Rasam', 'Steamed Rice & Rasam', 'Sona masoori rice with pepper rasam', 40, 'lunch', 'veg', 'Monday', 'Andhra', true, 30),
  ('317bf6f3-4697-451c-9ee7-a048c1ab2206', 'Beans Poriyal', 'Beans Poriyal', 'Stir-fried beans with coconut', 35, 'lunch', 'veg', 'Monday', 'Andhra', true, 30),
  ('317bf6f3-4697-451c-9ee7-a048c1ab2206', 'Gongura Pappu', 'Gongura Pappu', 'Dal cooked with tangy sorrel leaves', 50, 'lunch', 'veg', 'Tuesday', 'Andhra', true, 30),
  ('317bf6f3-4697-451c-9ee7-a048c1ab2206', 'Rice, Curd & Avakaya', 'Rice, Curd & Avakaya', 'Rice, home-set curd and mango pickle', 45, 'lunch', 'veg', 'Tuesday', 'Andhra', true, 30),
  ('317bf6f3-4697-451c-9ee7-a048c1ab2206', 'Gutti Vankaya Kura', 'Gutti Vankaya Kura', 'Stuffed brinjal in peanut-sesame masala', 60, 'lunch', 'veg', 'Wednesday', 'Andhra', true, 30),
  ('317bf6f3-4697-451c-9ee7-a048c1ab2206', 'Rice & Sambar', 'Rice & Sambar', 'Rice with drumstick sambar', 45, 'lunch', 'veg', 'Wednesday', 'Andhra', true, 30),
  ('317bf6f3-4697-451c-9ee7-a048c1ab2206', 'Andhra Chicken Curry', 'Andhra Chicken Curry', 'Spicy home-style chicken curry', 110, 'lunch', 'non-veg', 'Thursday', 'Andhra', true, 30),
  ('317bf6f3-4697-451c-9ee7-a048c1ab2206', 'Steamed Rice', 'Steamed Rice', 'Sona masoori rice', 25, 'lunch', 'veg', 'Thursday', 'Andhra', true, 30),
  ('317bf6f3-4697-451c-9ee7-a048c1ab2206', 'Pesarattu with Upma', 'Pesarattu with Upma', 'Green moong dosa stuffed with upma, ginger chutney', 70, 'lunch', 'veg', 'Friday', 'Andhra', true, 30),
  ('317bf6f3-4697-451c-9ee7-a048c1ab2206', 'Majjiga', 'Majjiga', 'Spiced buttermilk', 15, 'lunch', 'veg', 'Friday', 'Andhra', true, 30),
  ('317bf6f3-4697-451c-9ee7-a048c1ab2206', 'Pulihora', 'Pulihora', 'Tamarind rice with peanuts', 55, 'lunch', 'veg', 'Saturday', 'Andhra', true, 30),
  ('317bf6f3-4697-451c-9ee7-a048c1ab2206', 'Dondakaya Fry', 'Dondakaya Fry', 'Ivy gourd fry', 40, 'lunch', 'veg', 'Saturday', 'Andhra', true, 30),
  ('317bf6f3-4697-451c-9ee7-a048c1ab2206', 'Curd', 'Curd', 'Home-set curd', 15, 'lunch', 'veg', 'Saturday', 'Andhra', true, 30),
  ('317bf6f3-4697-451c-9ee7-a048c1ab2206', 'Kodi Pulao', 'Kodi Pulao', 'Andhra-style chicken pulao', 130, 'lunch', 'non-veg', 'Sunday', 'Andhra', true, 30),
  ('317bf6f3-4697-451c-9ee7-a048c1ab2206', 'Raita', 'Raita', 'Onion raita', 15, 'lunch', 'veg', 'Sunday', 'Andhra', true, 30),
  ('b68695e7-1ca3-4064-8cf4-2910aa8e3cda', 'Jolada Rotti (2)', 'Jolada Rotti (2)', 'Hand-patted jowar rotti', 30, 'lunch', 'veg', 'Monday', 'North Karnataka', true, 30),
  ('b68695e7-1ca3-4064-8cf4-2910aa8e3cda', 'Ennegai', 'Ennegai', 'Stuffed brinjal curry', 50, 'lunch', 'veg', 'Monday', 'North Karnataka', true, 30),
  ('b68695e7-1ca3-4064-8cf4-2910aa8e3cda', 'Rice & Saaru', 'Rice & Saaru', 'Rice with tomato saaru', 35, 'lunch', 'veg', 'Monday', 'North Karnataka', true, 30),
  ('b68695e7-1ca3-4064-8cf4-2910aa8e3cda', 'Chapati (3)', 'Chapati (3)', 'Soft wheat chapati', 30, 'lunch', 'veg', 'Tuesday', 'North Karnataka', true, 30),
  ('b68695e7-1ca3-4064-8cf4-2910aa8e3cda', 'Kaalu Palya', 'Kaalu Palya', 'Sprouted moong curry', 40, 'lunch', 'veg', 'Tuesday', 'North Karnataka', true, 30),
  ('b68695e7-1ca3-4064-8cf4-2910aa8e3cda', 'Mosaru Anna', 'Mosaru Anna', 'Curd rice', 35, 'lunch', 'veg', 'Tuesday', 'North Karnataka', true, 30),
  ('b68695e7-1ca3-4064-8cf4-2910aa8e3cda', 'Jolada Rotti (2)', 'Jolada Rotti (2)', 'Hand-patted jowar rotti', 30, 'lunch', 'veg', 'Wednesday', 'North Karnataka', true, 30),
  ('b68695e7-1ca3-4064-8cf4-2910aa8e3cda', 'Badanekai Palya', 'Badanekai Palya', 'Brinjal stir fry', 40, 'lunch', 'veg', 'Wednesday', 'North Karnataka', true, 30),
  ('b68695e7-1ca3-4064-8cf4-2910aa8e3cda', 'Bele Saaru & Rice', 'Bele Saaru & Rice', 'Dal rasam with rice', 40, 'lunch', 'veg', 'Wednesday', 'North Karnataka', true, 30),
  ('b68695e7-1ca3-4064-8cf4-2910aa8e3cda', 'Bisi Bele Bath', 'Bisi Bele Bath', 'Spiced rice-lentil one-pot with ghee', 70, 'lunch', 'veg', 'Thursday', 'North Karnataka', true, 30),
  ('b68695e7-1ca3-4064-8cf4-2910aa8e3cda', 'Boondi Raita', 'Boondi Raita', 'Curd with boondi', 20, 'lunch', 'veg', 'Thursday', 'North Karnataka', true, 30),
  ('b68695e7-1ca3-4064-8cf4-2910aa8e3cda', 'Chapati (3)', 'Chapati (3)', 'Soft wheat chapati', 30, 'lunch', 'veg', 'Friday', 'North Karnataka', true, 30),
  ('b68695e7-1ca3-4064-8cf4-2910aa8e3cda', 'Methi Pitla', 'Methi Pitla', 'Fenugreek besan curry', 40, 'lunch', 'veg', 'Friday', 'North Karnataka', true, 30),
  ('b68695e7-1ca3-4064-8cf4-2910aa8e3cda', 'Rice & Saaru', 'Rice & Saaru', 'Rice with tomato saaru', 35, 'lunch', 'veg', 'Friday', 'North Karnataka', true, 30),
  ('b68695e7-1ca3-4064-8cf4-2910aa8e3cda', 'Shenga Holige', 'Shenga Holige', 'Peanut-jaggery sweet flatbread', 45, 'lunch', 'veg', 'Saturday', 'North Karnataka', true, 30),
  ('b68695e7-1ca3-4064-8cf4-2910aa8e3cda', 'Ragi Mudde & Saaru', 'Ragi Mudde & Saaru', 'Finger millet balls with saaru', 55, 'lunch', 'veg', 'Saturday', 'North Karnataka', true, 30),
  ('b68695e7-1ca3-4064-8cf4-2910aa8e3cda', 'Jolada Rotti (2)', 'Jolada Rotti (2)', 'Hand-patted jowar rotti', 30, 'lunch', 'veg', 'Sunday', 'North Karnataka', true, 30),
  ('b68695e7-1ca3-4064-8cf4-2910aa8e3cda', 'Yennegai & Chutney Pudi', 'Yennegai & Chutney Pudi', 'Stuffed brinjal with groundnut chutney powder', 60, 'lunch', 'veg', 'Sunday', 'North Karnataka', true, 30),
  ('b68695e7-1ca3-4064-8cf4-2910aa8e3cda', 'Gulpavati', 'Gulpavati', 'Jaggery wheat sweet', 25, 'lunch', 'veg', 'Sunday', 'North Karnataka', true, 30),
  ('aa12772a-4ee8-407f-a19f-2cbebe4fcf85', 'Joha Rice', 'Joha Rice', 'Aromatic Assamese rice', 35, 'lunch', 'veg', 'Monday', 'Assamese', true, 30),
  ('aa12772a-4ee8-407f-a19f-2cbebe4fcf85', 'Matimah Dal', 'Matimah Dal', 'Black lentil dal', 40, 'lunch', 'veg', 'Monday', 'Assamese', true, 30),
  ('aa12772a-4ee8-407f-a19f-2cbebe4fcf85', 'Aloo Pitika', 'Aloo Pitika', 'Mashed potato with mustard oil and onion', 30, 'lunch', 'veg', 'Monday', 'Assamese', true, 30),
  ('aa12772a-4ee8-407f-a19f-2cbebe4fcf85', 'Rice', 'Rice', 'Steamed joha rice', 30, 'lunch', 'veg', 'Tuesday', 'Assamese', true, 30),
  ('aa12772a-4ee8-407f-a19f-2cbebe4fcf85', 'Papaya Khar', 'Papaya Khar', 'Papaya cooked with khar', 45, 'lunch', 'veg', 'Tuesday', 'Assamese', true, 30),
  ('aa12772a-4ee8-407f-a19f-2cbebe4fcf85', 'Bhaji', 'Bhaji', 'Seasonal greens', 30, 'lunch', 'veg', 'Tuesday', 'Assamese', true, 30),
  ('aa12772a-4ee8-407f-a19f-2cbebe4fcf85', 'Rice', 'Rice', 'Steamed joha rice', 30, 'lunch', 'veg', 'Wednesday', 'Assamese', true, 30),
  ('aa12772a-4ee8-407f-a19f-2cbebe4fcf85', 'Masor Tenga', 'Masor Tenga', 'Tangy tomato fish curry', 110, 'lunch', 'non-veg', 'Wednesday', 'Assamese', true, 30),
  ('aa12772a-4ee8-407f-a19f-2cbebe4fcf85', 'Rice', 'Rice', 'Steamed joha rice', 30, 'lunch', 'veg', 'Thursday', 'Assamese', true, 30),
  ('aa12772a-4ee8-407f-a19f-2cbebe4fcf85', 'Duck with Ash Gourd', 'Duck with Ash Gourd', 'Hanhor mangxo, slow cooked', 140, 'lunch', 'non-veg', 'Thursday', 'Assamese', true, 30),
  ('aa12772a-4ee8-407f-a19f-2cbebe4fcf85', 'Rice', 'Rice', 'Steamed joha rice', 30, 'lunch', 'veg', 'Friday', 'Assamese', true, 30),
  ('aa12772a-4ee8-407f-a19f-2cbebe4fcf85', 'Bilahi Dal', 'Bilahi Dal', 'Tomato dal', 40, 'lunch', 'veg', 'Friday', 'Assamese', true, 30),
  ('aa12772a-4ee8-407f-a19f-2cbebe4fcf85', 'Begena Bhaja', 'Begena Bhaja', 'Fried brinjal', 30, 'lunch', 'veg', 'Friday', 'Assamese', true, 30),
  ('aa12772a-4ee8-407f-a19f-2cbebe4fcf85', 'Khichdi', 'Khichdi', 'Assamese moong khichdi with ghee', 60, 'lunch', 'veg', 'Saturday', 'Assamese', true, 30),
  ('aa12772a-4ee8-407f-a19f-2cbebe4fcf85', 'Pitika Platter', 'Pitika Platter', 'Aloo, bilahi and begena pitika', 45, 'lunch', 'veg', 'Saturday', 'Assamese', true, 30),
  ('aa12772a-4ee8-407f-a19f-2cbebe4fcf85', 'Rice', 'Rice', 'Steamed joha rice', 30, 'lunch', 'veg', 'Sunday', 'Assamese', true, 30),
  ('aa12772a-4ee8-407f-a19f-2cbebe4fcf85', 'Masor Tenga', 'Masor Tenga', 'Tangy tomato fish curry', 110, 'lunch', 'non-veg', 'Sunday', 'Assamese', true, 30),
  ('aa12772a-4ee8-407f-a19f-2cbebe4fcf85', 'Til Pitha', 'Til Pitha', 'Rice cake with black sesame', 30, 'lunch', 'veg', 'Sunday', 'Assamese', true, 30),
  ('3d5f7b5e-efa9-4866-837f-8aca850b4f8a', 'Chapati (3)', 'Chapati (3)', 'Wheat chapati', 30, 'lunch', 'veg', 'Monday', 'Maharashtrian', true, 30),
  ('3d5f7b5e-efa9-4866-837f-8aca850b4f8a', 'Matki Usal', 'Matki Usal', 'Sprouted moth bean curry', 45, 'lunch', 'veg', 'Monday', 'Maharashtrian', true, 30),
  ('3d5f7b5e-efa9-4866-837f-8aca850b4f8a', 'Varan Bhaat', 'Varan Bhaat', 'Dal and rice with ghee', 40, 'lunch', 'veg', 'Monday', 'Maharashtrian', true, 30),
  ('3d5f7b5e-efa9-4866-837f-8aca850b4f8a', 'Jowar Bhakri (2)', 'Jowar Bhakri (2)', 'Jowar bhakri', 30, 'lunch', 'veg', 'Tuesday', 'Maharashtrian', true, 30),
  ('3d5f7b5e-efa9-4866-837f-8aca850b4f8a', 'Pithla', 'Pithla', 'Besan curry', 40, 'lunch', 'veg', 'Tuesday', 'Maharashtrian', true, 30),
  ('3d5f7b5e-efa9-4866-837f-8aca850b4f8a', 'Thecha', 'Thecha', 'Green chilli-garlic thecha', 10, 'lunch', 'veg', 'Tuesday', 'Maharashtrian', true, 30),
  ('3d5f7b5e-efa9-4866-837f-8aca850b4f8a', 'Chapati (3)', 'Chapati (3)', 'Wheat chapati', 30, 'lunch', 'veg', 'Wednesday', 'Maharashtrian', true, 30),
  ('3d5f7b5e-efa9-4866-837f-8aca850b4f8a', 'Chicken Kolhapuri', 'Chicken Kolhapuri', 'Spicy Kolhapuri chicken', 120, 'lunch', 'non-veg', 'Wednesday', 'Maharashtrian', true, 30),
  ('3d5f7b5e-efa9-4866-837f-8aca850b4f8a', 'Misal Pav', 'Misal Pav', 'Kolhapuri misal with farsan and pav', 70, 'lunch', 'veg', 'Thursday', 'Maharashtrian', true, 30),
  ('3d5f7b5e-efa9-4866-837f-8aca850b4f8a', 'Taak', 'Taak', 'Buttermilk', 15, 'lunch', 'veg', 'Thursday', 'Maharashtrian', true, 30),
  ('3d5f7b5e-efa9-4866-837f-8aca850b4f8a', 'Chapati (3)', 'Chapati (3)', 'Wheat chapati', 30, 'lunch', 'veg', 'Friday', 'Maharashtrian', true, 30),
  ('3d5f7b5e-efa9-4866-837f-8aca850b4f8a', 'Bharli Bhendi', 'Bharli Bhendi', 'Stuffed okra', 45, 'lunch', 'veg', 'Friday', 'Maharashtrian', true, 30),
  ('3d5f7b5e-efa9-4866-837f-8aca850b4f8a', 'Masale Bhaat', 'Masale Bhaat', 'Goda masala rice', 45, 'lunch', 'veg', 'Friday', 'Maharashtrian', true, 30),
  ('3d5f7b5e-efa9-4866-837f-8aca850b4f8a', 'Jowar Bhakri (2)', 'Jowar Bhakri (2)', 'Jowar bhakri', 30, 'lunch', 'veg', 'Saturday', 'Maharashtrian', true, 30),
  ('3d5f7b5e-efa9-4866-837f-8aca850b4f8a', 'Zunka', 'Zunka', 'Dry besan with onion', 40, 'lunch', 'veg', 'Saturday', 'Maharashtrian', true, 30),
  ('3d5f7b5e-efa9-4866-837f-8aca850b4f8a', 'Varan Bhaat', 'Varan Bhaat', 'Dal and rice', 40, 'lunch', 'veg', 'Saturday', 'Maharashtrian', true, 30),
  ('3d5f7b5e-efa9-4866-837f-8aca850b4f8a', 'Mutton Tambda Rassa', 'Mutton Tambda Rassa', 'Red mutton curry', 170, 'lunch', 'non-veg', 'Sunday', 'Maharashtrian', true, 30),
  ('3d5f7b5e-efa9-4866-837f-8aca850b4f8a', 'Pandhra Rassa', 'Pandhra Rassa', 'White mutton broth', 40, 'lunch', 'non-veg', 'Sunday', 'Maharashtrian', true, 30),
  ('3d5f7b5e-efa9-4866-837f-8aca850b4f8a', 'Jeera Rice', 'Jeera Rice', 'Jeera rice', 30, 'lunch', 'veg', 'Sunday', 'Maharashtrian', true, 30),
  ('5205e060-5ee0-447d-bc4b-f20464ef58a4', 'Rice & Drumstick Sambar', 'Rice & Drumstick Sambar', 'Rice with drumstick sambar', 50, 'lunch', 'veg', 'Monday', 'Tamil', true, 30),
  ('5205e060-5ee0-447d-bc4b-f20464ef58a4', 'Cabbage Poriyal', 'Cabbage Poriyal', 'Cabbage with coconut', 30, 'lunch', 'veg', 'Monday', 'Tamil', true, 30),
  ('5205e060-5ee0-447d-bc4b-f20464ef58a4', 'Curd Rice', 'Curd Rice', 'Curd rice with pomegranate', 35, 'lunch', 'veg', 'Monday', 'Tamil', true, 30),
  ('5205e060-5ee0-447d-bc4b-f20464ef58a4', 'Rice & Mor Kuzhambu', 'Rice & Mor Kuzhambu', 'Buttermilk curry, no onion-garlic', 50, 'lunch', 'veg', 'Tuesday', 'Tamil', true, 30),
  ('5205e060-5ee0-447d-bc4b-f20464ef58a4', 'Beans Usili', 'Beans Usili', 'Beans with crumbled dal', 35, 'lunch', 'veg', 'Tuesday', 'Tamil', true, 30),
  ('5205e060-5ee0-447d-bc4b-f20464ef58a4', 'Lemon Rice', 'Lemon Rice', 'Lemon rice with peanuts', 45, 'lunch', 'veg', 'Wednesday', 'Tamil', true, 30),
  ('5205e060-5ee0-447d-bc4b-f20464ef58a4', 'Avial', 'Avial', 'Mixed vegetables in coconut-curd', 45, 'lunch', 'veg', 'Wednesday', 'Tamil', true, 30),
  ('5205e060-5ee0-447d-bc4b-f20464ef58a4', 'Appalam', 'Appalam', 'Papad', 10, 'lunch', 'veg', 'Wednesday', 'Tamil', true, 30),
  ('5205e060-5ee0-447d-bc4b-f20464ef58a4', 'Rice & Vatha Kuzhambu', 'Rice & Vatha Kuzhambu', 'Tamarind sundakkai kuzhambu', 50, 'lunch', 'veg', 'Thursday', 'Tamil', true, 30),
  ('5205e060-5ee0-447d-bc4b-f20464ef58a4', 'Keerai Masiyal', 'Keerai Masiyal', 'Mashed spinach', 35, 'lunch', 'veg', 'Thursday', 'Tamil', true, 30),
  ('5205e060-5ee0-447d-bc4b-f20464ef58a4', 'Rasam', 'Rasam', 'Tomato rasam', 20, 'lunch', 'veg', 'Thursday', 'Tamil', true, 30),
  ('5205e060-5ee0-447d-bc4b-f20464ef58a4', 'Sevai', 'Sevai', 'Rice noodles, lemon and coconut', 60, 'lunch', 'veg', 'Friday', 'Tamil', true, 30),
  ('5205e060-5ee0-447d-bc4b-f20464ef58a4', 'Coconut Chutney', 'Coconut Chutney', 'Coconut chutney', 10, 'lunch', 'veg', 'Friday', 'Tamil', true, 30),
  ('5205e060-5ee0-447d-bc4b-f20464ef58a4', 'Pongal', 'Pongal', 'Ven pongal with ghee and pepper', 55, 'lunch', 'veg', 'Saturday', 'Tamil', true, 30),
  ('5205e060-5ee0-447d-bc4b-f20464ef58a4', 'Sambar & Chutney', 'Sambar & Chutney', 'Sambar and coconut chutney', 25, 'lunch', 'veg', 'Saturday', 'Tamil', true, 30),
  ('5205e060-5ee0-447d-bc4b-f20464ef58a4', 'Rice & Pumpkin Sambar', 'Rice & Pumpkin Sambar', 'Rice with pumpkin sambar', 50, 'lunch', 'veg', 'Sunday', 'Tamil', true, 30),
  ('5205e060-5ee0-447d-bc4b-f20464ef58a4', 'Potato Roast', 'Potato Roast', 'Potato roast', 35, 'lunch', 'veg', 'Sunday', 'Tamil', true, 30),
  ('5205e060-5ee0-447d-bc4b-f20464ef58a4', 'Paal Payasam', 'Paal Payasam', 'Rice kheer', 30, 'lunch', 'veg', 'Sunday', 'Tamil', true, 30),
  ('efb6c8da-f7b8-4f9b-9b8e-34c0986edafa', 'Khichdi & Khatta', 'Khichdi & Khatta', 'Masoor khichdi with tangy tamarind khatta', 60, 'lunch', 'veg', 'Monday', 'Deccani', true, 30),
  ('efb6c8da-f7b8-4f9b-9b8e-34c0986edafa', 'Kheema', 'Kheema', 'Minced mutton', 90, 'lunch', 'non-veg', 'Monday', 'Deccani', true, 30),
  ('efb6c8da-f7b8-4f9b-9b8e-34c0986edafa', 'Chapati (3)', 'Chapati (3)', 'Wheat chapati', 30, 'lunch', 'veg', 'Tuesday', 'Deccani', true, 30),
  ('efb6c8da-f7b8-4f9b-9b8e-34c0986edafa', 'Dalcha', 'Dalcha', 'Lentils with bottle gourd', 45, 'lunch', 'veg', 'Tuesday', 'Deccani', true, 30),
  ('efb6c8da-f7b8-4f9b-9b8e-34c0986edafa', 'Bagara Rice', 'Bagara Rice', 'Spiced whole-garam-masala rice', 40, 'lunch', 'veg', 'Tuesday', 'Deccani', true, 30),
  ('efb6c8da-f7b8-4f9b-9b8e-34c0986edafa', 'Chapati (3)', 'Chapati (3)', 'Wheat chapati', 30, 'lunch', 'veg', 'Wednesday', 'Deccani', true, 30),
  ('efb6c8da-f7b8-4f9b-9b8e-34c0986edafa', 'Chicken Korma', 'Chicken Korma', 'Home-style korma', 110, 'lunch', 'non-veg', 'Wednesday', 'Deccani', true, 30),
  ('efb6c8da-f7b8-4f9b-9b8e-34c0986edafa', 'Bagara Rice', 'Bagara Rice', 'Spiced rice', 40, 'lunch', 'veg', 'Thursday', 'Deccani', true, 30),
  ('efb6c8da-f7b8-4f9b-9b8e-34c0986edafa', 'Mirchi ka Salan', 'Mirchi ka Salan', 'Chilli-peanut curry', 45, 'lunch', 'veg', 'Thursday', 'Deccani', true, 30),
  ('efb6c8da-f7b8-4f9b-9b8e-34c0986edafa', 'Dahi Chutney', 'Dahi Chutney', 'Curd chutney', 15, 'lunch', 'veg', 'Thursday', 'Deccani', true, 30),
  ('efb6c8da-f7b8-4f9b-9b8e-34c0986edafa', 'Chicken Dum Biryani', 'Chicken Dum Biryani', 'Hyderabadi-style dum biryani', 150, 'lunch', 'non-veg', 'Friday', 'Deccani', true, 30),
  ('efb6c8da-f7b8-4f9b-9b8e-34c0986edafa', 'Mirchi ka Salan & Raita', 'Mirchi ka Salan & Raita', 'Salan and raita', 20, 'lunch', 'veg', 'Friday', 'Deccani', true, 30),
  ('efb6c8da-f7b8-4f9b-9b8e-34c0986edafa', 'Chapati (3)', 'Chapati (3)', 'Wheat chapati', 30, 'lunch', 'veg', 'Saturday', 'Deccani', true, 30),
  ('efb6c8da-f7b8-4f9b-9b8e-34c0986edafa', 'Bhindi Do Pyaza', 'Bhindi Do Pyaza', 'Okra with onions', 45, 'lunch', 'veg', 'Saturday', 'Deccani', true, 30),
  ('efb6c8da-f7b8-4f9b-9b8e-34c0986edafa', 'Dal Fry', 'Dal Fry', 'Dal fry', 35, 'lunch', 'veg', 'Saturday', 'Deccani', true, 30),
  ('efb6c8da-f7b8-4f9b-9b8e-34c0986edafa', 'Mutton Dum Biryani', 'Mutton Dum Biryani', 'Hyderabadi-style mutton biryani', 190, 'lunch', 'non-veg', 'Sunday', 'Deccani', true, 30),
  ('efb6c8da-f7b8-4f9b-9b8e-34c0986edafa', 'Double ka Meetha', 'Double ka Meetha', 'Bread pudding', 30, 'lunch', 'veg', 'Sunday', 'Deccani', true, 30),
  ('bb6c98f6-9c20-4358-bbfb-1f2929f7ffb9', 'Rice', 'Rice', 'Steamed local rice', 25, 'lunch', 'veg', 'Monday', 'Arunachali', true, 30),
  ('bb6c98f6-9c20-4358-bbfb-1f2929f7ffb9', 'Boiled Greens & Chutney', 'Boiled Greens & Chutney', 'Seasonal greens with chilli chutney', 40, 'lunch', 'veg', 'Monday', 'Arunachali', true, 30),
  ('bb6c98f6-9c20-4358-bbfb-1f2929f7ffb9', 'Dal', 'Dal', 'Plain dal', 30, 'lunch', 'veg', 'Monday', 'Arunachali', true, 30),
  ('bb6c98f6-9c20-4358-bbfb-1f2929f7ffb9', 'Rice', 'Rice', 'Steamed local rice', 25, 'lunch', 'veg', 'Tuesday', 'Arunachali', true, 30),
  ('bb6c98f6-9c20-4358-bbfb-1f2929f7ffb9', 'Smoked Pork with Bamboo Shoot', 'Smoked Pork with Bamboo Shoot', 'Smoked pork cooked with fermented bamboo shoot', 140, 'lunch', 'non-veg', 'Tuesday', 'Arunachali', true, 30),
  ('bb6c98f6-9c20-4358-bbfb-1f2929f7ffb9', 'Rice', 'Rice', 'Steamed local rice', 25, 'lunch', 'veg', 'Wednesday', 'Arunachali', true, 30),
  ('bb6c98f6-9c20-4358-bbfb-1f2929f7ffb9', 'Chicken with Bamboo Shoot', 'Chicken with Bamboo Shoot', 'Chicken stew with bamboo shoot', 110, 'lunch', 'non-veg', 'Wednesday', 'Arunachali', true, 30),
  ('bb6c98f6-9c20-4358-bbfb-1f2929f7ffb9', 'Rice', 'Rice', 'Steamed local rice', 25, 'lunch', 'veg', 'Thursday', 'Arunachali', true, 30),
  ('bb6c98f6-9c20-4358-bbfb-1f2929f7ffb9', 'Lai Patta & Potato', 'Lai Patta & Potato', 'Mustard greens with potato', 40, 'lunch', 'veg', 'Thursday', 'Arunachali', true, 30),
  ('bb6c98f6-9c20-4358-bbfb-1f2929f7ffb9', 'Pika Pila', 'Pika Pila', 'Bamboo shoot pickle', 15, 'lunch', 'veg', 'Thursday', 'Arunachali', true, 30),
  ('bb6c98f6-9c20-4358-bbfb-1f2929f7ffb9', 'Rice', 'Rice', 'Steamed local rice', 25, 'lunch', 'veg', 'Friday', 'Arunachali', true, 30),
  ('bb6c98f6-9c20-4358-bbfb-1f2929f7ffb9', 'Fish in Bamboo', 'Fish in Bamboo', 'Fish cooked in bamboo tube', 130, 'lunch', 'non-veg', 'Friday', 'Arunachali', true, 30),
  ('bb6c98f6-9c20-4358-bbfb-1f2929f7ffb9', 'Veg Thukpa', 'Veg Thukpa', 'Noodle soup with vegetables', 80, 'lunch', 'veg', 'Saturday', 'Arunachali', true, 30),
  ('bb6c98f6-9c20-4358-bbfb-1f2929f7ffb9', 'Veg Momos (6)', 'Veg Momos (6)', 'Steamed momos with chutney', 60, 'lunch', 'veg', 'Saturday', 'Arunachali', true, 30),
  ('bb6c98f6-9c20-4358-bbfb-1f2929f7ffb9', 'Pork Momos (8)', 'Pork Momos (8)', 'Steamed pork momos', 100, 'lunch', 'non-veg', 'Sunday', 'Arunachali', true, 30),
  ('bb6c98f6-9c20-4358-bbfb-1f2929f7ffb9', 'Chicken Thukpa', 'Chicken Thukpa', 'Noodle soup with chicken', 100, 'lunch', 'non-veg', 'Sunday', 'Arunachali', true, 30),
  ('c9a51680-356b-4ab9-85f7-85e11a577e59', 'Poli (3)', 'Poli (3)', 'Thin wheat poli with ghee', 30, 'lunch', 'veg', 'Monday', 'Maharashtrian', true, 30),
  ('c9a51680-356b-4ab9-85f7-85e11a577e59', 'Batata Bhaji', 'Batata Bhaji', 'Dry potato bhaji', 35, 'lunch', 'veg', 'Monday', 'Maharashtrian', true, 30),
  ('c9a51680-356b-4ab9-85f7-85e11a577e59', 'Aamti Bhaat', 'Aamti Bhaat', 'Goda masala dal and rice', 45, 'lunch', 'veg', 'Monday', 'Maharashtrian', true, 30),
  ('c9a51680-356b-4ab9-85f7-85e11a577e59', 'Poli (3)', 'Poli (3)', 'Thin wheat poli with ghee', 30, 'lunch', 'veg', 'Tuesday', 'Maharashtrian', true, 30),
  ('c9a51680-356b-4ab9-85f7-85e11a577e59', 'Methi Bhaji', 'Methi Bhaji', 'Fenugreek bhaji', 35, 'lunch', 'veg', 'Tuesday', 'Maharashtrian', true, 30),
  ('c9a51680-356b-4ab9-85f7-85e11a577e59', 'Varan Bhaat & Toop', 'Varan Bhaat & Toop', 'Plain dal, rice and ghee', 40, 'lunch', 'veg', 'Tuesday', 'Maharashtrian', true, 30),
  ('c9a51680-356b-4ab9-85f7-85e11a577e59', 'Poli (3)', 'Poli (3)', 'Thin wheat poli', 30, 'lunch', 'veg', 'Wednesday', 'Maharashtrian', true, 30),
  ('c9a51680-356b-4ab9-85f7-85e11a577e59', 'Pithla', 'Pithla', 'Besan curry', 35, 'lunch', 'veg', 'Wednesday', 'Maharashtrian', true, 30),
  ('c9a51680-356b-4ab9-85f7-85e11a577e59', 'Kakdi Koshimbir', 'Kakdi Koshimbir', 'Cucumber salad', 15, 'lunch', 'veg', 'Wednesday', 'Maharashtrian', true, 30),
  ('c9a51680-356b-4ab9-85f7-85e11a577e59', 'Bhaat', 'Bhaat', 'Rice', 20, 'lunch', 'veg', 'Wednesday', 'Maharashtrian', true, 30),
  ('c9a51680-356b-4ab9-85f7-85e11a577e59', 'Sabudana Khichdi', 'Sabudana Khichdi', 'Sago khichdi with peanuts', 55, 'lunch', 'veg', 'Thursday', 'Maharashtrian', true, 30),
  ('c9a51680-356b-4ab9-85f7-85e11a577e59', 'Dahi', 'Dahi', 'Curd', 15, 'lunch', 'veg', 'Thursday', 'Maharashtrian', true, 30),
  ('c9a51680-356b-4ab9-85f7-85e11a577e59', 'Poli (3)', 'Poli (3)', 'Thin wheat poli', 30, 'lunch', 'veg', 'Friday', 'Maharashtrian', true, 30),
  ('c9a51680-356b-4ab9-85f7-85e11a577e59', 'Bharli Vangi', 'Bharli Vangi', 'Stuffed brinjal', 45, 'lunch', 'veg', 'Friday', 'Maharashtrian', true, 30),
  ('c9a51680-356b-4ab9-85f7-85e11a577e59', 'Masale Bhaat', 'Masale Bhaat', 'Goda masala rice', 45, 'lunch', 'veg', 'Friday', 'Maharashtrian', true, 30),
  ('c9a51680-356b-4ab9-85f7-85e11a577e59', 'Thalipeeth (2)', 'Thalipeeth (2)', 'Multigrain thalipeeth with butter', 60, 'lunch', 'veg', 'Saturday', 'Maharashtrian', true, 30),
  ('c9a51680-356b-4ab9-85f7-85e11a577e59', 'Dahi', 'Dahi', 'Curd', 15, 'lunch', 'veg', 'Saturday', 'Maharashtrian', true, 30),
  ('c9a51680-356b-4ab9-85f7-85e11a577e59', 'Puran Poli (2)', 'Puran Poli (2)', 'Chana dal-jaggery stuffed poli', 70, 'lunch', 'veg', 'Sunday', 'Maharashtrian', true, 30),
  ('c9a51680-356b-4ab9-85f7-85e11a577e59', 'Katachi Aamti', 'Katachi Aamti', 'Spiced puran stock', 25, 'lunch', 'veg', 'Sunday', 'Maharashtrian', true, 30),
  ('c9a51680-356b-4ab9-85f7-85e11a577e59', 'Bhaat', 'Bhaat', 'Rice', 20, 'lunch', 'veg', 'Sunday', 'Maharashtrian', true, 30),
  ('9dcf2a39-e599-4c03-9c75-a9290050fb21', 'Chapati (3)', 'Chapati (3)', 'Wheat chapati', 30, 'lunch', 'veg', 'Monday', 'North Karnataka', true, 30),
  ('9dcf2a39-e599-4c03-9c75-a9290050fb21', 'Mixed Kaalu Palya', 'Mixed Kaalu Palya', 'Mixed legume curry', 40, 'lunch', 'veg', 'Monday', 'North Karnataka', true, 30),
  ('9dcf2a39-e599-4c03-9c75-a9290050fb21', 'Rice & Saaru', 'Rice & Saaru', 'Rice with saaru', 35, 'lunch', 'veg', 'Monday', 'North Karnataka', true, 30),
  ('9dcf2a39-e599-4c03-9c75-a9290050fb21', 'Jolada Rotti (2)', 'Jolada Rotti (2)', 'Jowar rotti', 30, 'lunch', 'veg', 'Tuesday', 'North Karnataka', true, 30),
  ('9dcf2a39-e599-4c03-9c75-a9290050fb21', 'Mulagai Palya', 'Mulagai Palya', 'Radish leaf stir fry', 35, 'lunch', 'veg', 'Tuesday', 'North Karnataka', true, 30),
  ('9dcf2a39-e599-4c03-9c75-a9290050fb21', 'Rice & Saaru', 'Rice & Saaru', 'Rice with saaru', 35, 'lunch', 'veg', 'Tuesday', 'North Karnataka', true, 30),
  ('9dcf2a39-e599-4c03-9c75-a9290050fb21', 'Girmit', 'Girmit', 'Puffed rice with onion-tomato masala', 40, 'lunch', 'veg', 'Wednesday', 'North Karnataka', true, 30),
  ('9dcf2a39-e599-4c03-9c75-a9290050fb21', 'Mirchi Bajji (2)', 'Mirchi Bajji (2)', 'Stuffed chilli fritters', 30, 'lunch', 'veg', 'Wednesday', 'North Karnataka', true, 30),
  ('9dcf2a39-e599-4c03-9c75-a9290050fb21', 'Chapati (3)', 'Chapati (3)', 'Wheat chapati', 30, 'lunch', 'veg', 'Thursday', 'North Karnataka', true, 30),
  ('9dcf2a39-e599-4c03-9c75-a9290050fb21', 'Badanekai Ennegai', 'Badanekai Ennegai', 'Stuffed brinjal', 50, 'lunch', 'veg', 'Thursday', 'North Karnataka', true, 30),
  ('9dcf2a39-e599-4c03-9c75-a9290050fb21', 'Mosaru Anna', 'Mosaru Anna', 'Curd rice', 35, 'lunch', 'veg', 'Thursday', 'North Karnataka', true, 30),
  ('9dcf2a39-e599-4c03-9c75-a9290050fb21', 'Uppittu', 'Uppittu', 'Rava upma with vegetables', 40, 'lunch', 'veg', 'Friday', 'North Karnataka', true, 30),
  ('9dcf2a39-e599-4c03-9c75-a9290050fb21', 'Kesari Bath', 'Kesari Bath', 'Rava sweet', 30, 'lunch', 'veg', 'Friday', 'North Karnataka', true, 30),
  ('9dcf2a39-e599-4c03-9c75-a9290050fb21', 'Jolada Rotti (2)', 'Jolada Rotti (2)', 'Jowar rotti', 30, 'lunch', 'veg', 'Saturday', 'North Karnataka', true, 30),
  ('9dcf2a39-e599-4c03-9c75-a9290050fb21', 'Kadale Usli', 'Kadale Usli', 'Chickpea usli', 35, 'lunch', 'veg', 'Saturday', 'North Karnataka', true, 30),
  ('9dcf2a39-e599-4c03-9c75-a9290050fb21', 'Rice & Saaru', 'Rice & Saaru', 'Rice with saaru', 35, 'lunch', 'veg', 'Saturday', 'North Karnataka', true, 30),
  ('9dcf2a39-e599-4c03-9c75-a9290050fb21', 'Khanavali Oota', 'Khanavali Oota', 'Rotti, two palyas, chutney pudi, rice, saaru, curd, sweet', 140, 'lunch', 'veg', 'Sunday', 'North Karnataka', true, 30),
  ('8661924b-fafe-470c-852b-e9d0b11b2d05', 'Veg Hakka Noodles', 'Veg Hakka Noodles', 'Wok-tossed noodles', 70, 'lunch', 'veg', 'Monday', 'Indo-Chinese', true, 30),
  ('8661924b-fafe-470c-852b-e9d0b11b2d05', 'Veg Manchurian Gravy', 'Veg Manchurian Gravy', 'Manchurian in gravy', 50, 'lunch', 'veg', 'Monday', 'Indo-Chinese', true, 30),
  ('8661924b-fafe-470c-852b-e9d0b11b2d05', 'Veg Fried Rice', 'Veg Fried Rice', 'Wok fried rice', 65, 'lunch', 'veg', 'Tuesday', 'Indo-Chinese', true, 30),
  ('8661924b-fafe-470c-852b-e9d0b11b2d05', 'Chilli Paneer', 'Chilli Paneer', 'Dry chilli paneer', 70, 'lunch', 'veg', 'Tuesday', 'Indo-Chinese', true, 30),
  ('8661924b-fafe-470c-852b-e9d0b11b2d05', 'Chicken Fried Rice', 'Chicken Fried Rice', 'Wok fried rice with chicken', 85, 'lunch', 'non-veg', 'Wednesday', 'Indo-Chinese', true, 30),
  ('8661924b-fafe-470c-852b-e9d0b11b2d05', 'Chilli Chicken', 'Chilli Chicken', 'Dry chilli chicken', 80, 'lunch', 'non-veg', 'Wednesday', 'Indo-Chinese', true, 30),
  ('8661924b-fafe-470c-852b-e9d0b11b2d05', 'Schezwan Noodles', 'Schezwan Noodles', 'Spicy schezwan noodles', 75, 'lunch', 'veg', 'Thursday', 'Indo-Chinese', true, 30),
  ('8661924b-fafe-470c-852b-e9d0b11b2d05', 'Hot & Sour Soup', 'Hot & Sour Soup', 'Veg hot and sour soup', 30, 'lunch', 'veg', 'Thursday', 'Indo-Chinese', true, 30),
  ('8661924b-fafe-470c-852b-e9d0b11b2d05', 'Chicken Hakka Noodles', 'Chicken Hakka Noodles', 'Noodles with chicken', 85, 'lunch', 'non-veg', 'Friday', 'Indo-Chinese', true, 30),
  ('8661924b-fafe-470c-852b-e9d0b11b2d05', 'Chicken Manchurian', 'Chicken Manchurian', 'Chicken manchurian gravy', 70, 'lunch', 'non-veg', 'Friday', 'Indo-Chinese', true, 30),
  ('8661924b-fafe-470c-852b-e9d0b11b2d05', 'Chicken Momos (8)', 'Chicken Momos (8)', 'Steamed momos with tomato achar', 100, 'lunch', 'non-veg', 'Saturday', 'Indo-Chinese', true, 30),
  ('8661924b-fafe-470c-852b-e9d0b11b2d05', 'Veg Thukpa', 'Veg Thukpa', 'Noodle soup', 70, 'lunch', 'veg', 'Saturday', 'Indo-Chinese', true, 30),
  ('8661924b-fafe-470c-852b-e9d0b11b2d05', 'Shaphaley (2)', 'Shaphaley (2)', 'Fried bread stuffed with spiced meat', 90, 'lunch', 'non-veg', 'Sunday', 'Indo-Chinese', true, 30),
  ('8661924b-fafe-470c-852b-e9d0b11b2d05', 'Veg Momos (8)', 'Veg Momos (8)', 'Steamed momos', 80, 'lunch', 'veg', 'Sunday', 'Indo-Chinese', true, 30);

-- 4. Keep the duplicated columns in sync going forward -----------------------
update public.cooks set "isAvailable" = is_available where "isAvailable" is distinct from is_available;

commit;

-- Sanity check
-- select first_name, last_name, city, rating, (select count(*) from dabba_menu m where m.cook_id = c.id and m.is_available) as items
-- from cooks c order by city;
