-- Profile photos for the 10 demo cooks (served from /public/cook-photos).
-- AI-generated portraits of fictional people (Figma AI). Replace as real cooks
-- upload their own photos through the cook profile form.
update public.cooks set profile_image = '/cook-photos/' || id || '.jpg'
where id in (
  '317bf6f3-4697-451c-9ee7-a048c1ab2206','b68695e7-1ca3-4064-8cf4-2910aa8e3cda',
  'aa12772a-4ee8-407f-a19f-2cbebe4fcf85','3d5f7b5e-efa9-4866-837f-8aca850b4f8a',
  '5205e060-5ee0-447d-bc4b-f20464ef58a4','efb6c8da-f7b8-4f9b-9b8e-34c0986edafa',
  'bb6c98f6-9c20-4358-bbfb-1f2929f7ffb9','c9a51680-356b-4ab9-85f7-85e11a577e59',
  '9dcf2a39-e599-4c03-9c75-a9290050fb21','8661924b-fafe-470c-852b-e9d0b11b2d05'
);
