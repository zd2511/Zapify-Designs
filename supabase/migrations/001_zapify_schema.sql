-- Zapify Supabase initial schema + seed
create extension if not exists pgcrypto;

create table if not exists public.profiles (id uuid primary key references auth.users(id) on delete cascade, email text, full_name text, phone text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.templates (id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null, description text default '', category text not null, base_price numeric(10,2) not null default 100, currency text not null default 'ZAR', preview_url text, template_path text, active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.features (id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null, description text default '', category text not null, price numeric(10,2) not null default 0, is_paid boolean not null default false, active boolean not null default true, css_feature text, created_at timestamptz not null default now());
create table if not exists public.template_features (template_id uuid references public.templates(id) on delete cascade, feature_id uuid references public.features(id) on delete cascade, enabled boolean not null default true, primary key(template_id,feature_id));
create table if not exists public.projects (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, template_id uuid references public.templates(id), name text not null default 'Untitled project', status text not null default 'draft', customization jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.project_features (id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade, feature_id uuid not null references public.features(id), price_at_purchase numeric(10,2) not null default 0, created_at timestamptz not null default now(), unique(project_id,feature_id));
create table if not exists public.project_images (id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade, storage_path text not null, image_type text default 'content', sort_order integer not null default 0, created_at timestamptz not null default now());
create table if not exists public.orders (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete set null, project_id uuid references public.projects(id) on delete set null, order_reference text unique not null, template_id uuid references public.templates(id), base_price numeric(10,2) not null, feature_total numeric(10,2) not null default 0, additional_images integer not null default 0, additional_image_total numeric(10,2) not null default 0, total_amount numeric(10,2) not null, currency text not null default 'ZAR', status text not null default 'pending', customer jsonb not null default '{}'::jsonb, customization jsonb not null default '{}'::jsonb, client_request_id text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.order_items (id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade, item_type text not null, item_id text, name text not null, quantity integer not null default 1, unit_price numeric(10,2) not null, total_price numeric(10,2) not null, metadata jsonb not null default '{}'::jsonb);
create table if not exists public.payments (id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade, provider text not null default 'yoco', provider_checkout_id text, provider_reference text, amount numeric(10,2) not null, currency text not null default 'ZAR', status text not null default 'pending', raw_status text, paid_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(provider,provider_checkout_id));
create unique index if not exists orders_client_request_idx on public.orders(client_request_id) where client_request_id is not null;
create index if not exists projects_user_idx on public.projects(user_id); create index if not exists orders_user_idx on public.orders(user_id); create index if not exists images_project_idx on public.project_images(project_id);

insert into public.templates(slug,name,description,category,base_price) values
('salon','Lumi Beauty','Salon / Beauty','Salon / Beauty',100),
('mechanic','Vaal Auto','Automotive','Automotive',100),
('restaurant','Casa Vero','Restaurant / Café','Restaurant / Café',100),
('photographer','Nova Studio','Photography / Creative','Photography / Creative',100),
('construction','Build Vaal','Construction','Construction',100),
('scrapbook','Digital Scrapbook','Personal / Creative','Personal / Creative',100)
on conflict(slug) do update set name=excluded.name,category=excluded.category,base_price=excluded.base_price;

insert into public.features(slug,name,description,category,price,is_paid,css_feature) values
('sticky-navigation','Sticky navigation','Keep the main navigation visible while scrolling.','functionality',0,false,null),
('mobile-menu','Mobile menu','Add a responsive mobile navigation drawer.','functionality',0,false,null),
('smooth-scroll','Smooth scrolling','Smoothly scroll visitors to page sections.','functionality',0,false,null),
('scroll-to-top','Scroll-to-top button','Give visitors a quick way back to the top.','functionality',0,false,null),
('image-placement','Image placement','Control how uploaded images are positioned.','images',0,false,null),
('image-size','Image sizing','Adjust image sizing and proportions.','images',0,false,null),
('image-shapes','Image shapes','Use rounded or custom image shapes.','images',0,false,null),
('gallery-captions','Gallery captions','Show captions on gallery images.','images',0,false,null),
('gallery-lightbox','Gallery lightbox','Let visitors enlarge gallery images.','images',0,false,null),
('section-width','Section width','Use a wider content area for sections.','design',0,false,null),
('section-spacing','Section spacing','Adjust spacing between major sections.','design',0,false,null),
('section-alignment','Section alignment','Align section content to the left or centre.','design',0,false,null),
('social-links','Social media links','Display your social profiles in the site.','content',0,false,null),
('testimonial-section','Testimonials section','Add a simple customer testimonials section.','content',0,false,null),
('contact-section','Contact section','Add a basic contact-information section.','content',0,false,null),
('custom-palette','Custom colours','Choose your own primary, background and text palette.','design',50,true,null),
('custom-font-pairing','Custom font pairing','Choose a custom heading and body font combination.','design',35,true,null),
('gallery-layout','Advanced gallery layout','Use a featured or masonry-style gallery composition.','images',45,true,null),
('gallery-placement','Gallery placement','Move the gallery to a different position in the page flow.','images',40,true,null),
('before-after-images','Before & after images','Add a before-and-after presentation for visual work.','images',60,true,null),
('booking-url','Booking URL','Connect booking actions to your external booking page.','functionality',50,true,null),
('google-url','Google Maps URL','Connect location actions to a Google Maps location.','functionality',50,true,null),
('contact-form','Contact form','Add a structured visitor enquiry form.','functionality',60,true,null),
('faq-section','FAQ section','Add an expandable frequently-asked-questions section.','content',40,true,null),
('pricing-section','Pricing section','Add a structured pricing/options section.','content',45,true,null),
('blog-section','Blog/news section','Add a news or article preview section.','content',55,true,null),
('newsletter-section','Newsletter section','Add a newsletter signup call-to-action section.','content',40,true,null),
('timeline-section','Timeline section','Add a chronological timeline section.','content',45,true,null),
('seo-setup','SEO setup','Configure core page title, description and indexing settings.','seo',50,true,null),
('analytics-tracking','Analytics tracking','Connect Google Analytics tracking to the site.','seo',50,true,null),
('scrapbook-stickers','Sticker pack','Add decorative scrapbook stickers and symbols.','scrapbook',0,false,'scrapbook-stickers'),
('scrapbook-washi','Washi tape','Add layered washi-tape decorations.','scrapbook',0,false,'scrapbook-washi'),
('scrapbook-paper','Paper texture','Choose a paper texture for the scrapbook.','scrapbook',0,false,'scrapbook-paper'),
('scrapbook-polaroids','Polaroid photos','Turn memory photos into polaroid-style cards.','scrapbook',30,true,'scrapbook-polaroids'),
('scrapbook-collage','Layered collage','Arrange photos and notes in a scrapbook collage.','scrapbook',45,true,'scrapbook-collage'),
('scrapbook-journal','Journal entries','Add journal-style memory notes.','scrapbook',0,false,'scrapbook-journal'),
('scrapbook-dates','Date stamps','Show dates as scrapbook stamps.','scrapbook',0,false,'scrapbook-dates'),
('scrapbook-locations','Location tags','Show where each memory happened.','scrapbook',0,false,'scrapbook-locations'),
('scrapbook-timeline','Memory timeline','Arrange memories into a visual timeline.','scrapbook',45,true,'scrapbook-timeline'),
('scrapbook-guestbook','Guestbook','Add a guest memory/message area.','scrapbook',50,true,'scrapbook-guestbook'),
('scrapbook-music','Memory soundtrack','Add a music/audio area for the scrapbook.','scrapbook',50,true,'scrapbook-music'),
('scrapbook-countdown','Memory countdown','Show a countdown to an event or milestone.','scrapbook',25,true,'scrapbook-countdown'),
('scrapbook-quote','Quote cards','Add decorative quote cards between memories.','scrapbook',25,true,'scrapbook-quote'),
('scrapbook-private','Private memory pages','Visually mark selected pages as private.','scrapbook',50,true,'scrapbook-private'),
('paper-colour','Paper colour','Change the scrapbook paper colour treatment.','scrapbook',0,false,'paper-colour'),
('background-texture','Background texture','Add a tactile scrapbook background texture.','scrapbook',0,false,'background-texture'),
('notebook-style','Notebook paper','Use a lined notebook-paper look.','scrapbook',0,false,'notebook-style'),
('torn-edges','Torn edges','Give scrapbook sections torn-paper edges.','scrapbook',0,false,'torn-edges'),
('tape-decoration','Tape decoration','Add extra tape decoration around the scrapbook.','scrapbook',0,false,'tape-decoration'),
('sticker-decorations','Sticker decorations','Add decorative sticker-style accents.','scrapbook',0,false,'sticker-decorations'),
('photo-shadow','Photo shadows','Add deeper physical-photo shadows.','scrapbook',0,false,'photo-shadow'),
('photo-rotation','Photo rotation','Rotate photos for a handmade scrapbook feel.','scrapbook',0,false,'photo-rotation'),
('photo-borders','Photo borders','Add classic printed-photo borders.','scrapbook',0,false,'photo-borders'),
('border-thickness','Photo border thickness','Increase the printed border around photos.','scrapbook',0,false,'border-thickness'),
('border-colour','Photo border colour','Match photo borders to the scrapbook palette.','scrapbook',0,false,'border-colour'),
('doodles','Hand-drawn doodles','Add pencil-style doodle decorations.','scrapbook',0,false,'doodles'),
('handwritten-font','Handwritten headings','Use a handwritten style for scrapbook headings.','scrapbook',0,false,'handwritten-font'),
('caption-handwriting','Handwritten captions','Use handwritten styling for photo captions.','scrapbook',0,false,'caption-handwriting'),
('handwriting-colour','Handwriting colour','Accent handwritten elements with the scrapbook colour.','scrapbook',0,false,'handwriting-colour'),
('scrapbook-background','Scrapbook background','Add a layered scrapbook-style background treatment.','scrapbook',30,true,'scrapbook-background'),
('custom-sticker','Custom sticker','Add a custom sticker-style label to the scrapbook.','scrapbook',20,true,'custom-sticker'),
('photo-captions','Photo captions','Add memory captions below photos.','scrapbook',0,false,'photo-captions'),
('journal-entries','Journal note styling','Style memory text like a handwritten journal entry.','scrapbook',0,false,'journal-entries'),
('date-stamps','Vintage date stamps','Add decorative date stamps to pages.','scrapbook',0,false,'date-stamps'),
('location-stamp','Location stamp','Add a stamped memory-location marker.','scrapbook',0,false,'location-stamp'),
('memory-timeline','Timeline layout','Use a dedicated memory timeline layout.','scrapbook',0,false,'memory-timeline'),
('paper-layouts','Paper layouts','Change the paper/card layout composition.','scrapbook',0,false,'paper-layouts'),
('photo-collage','Photo collage','Use a denser photo collage composition.','scrapbook',45,true,'photo-collage'),
('masonry-gallery','Masonry memory gallery','Arrange memory photos in a masonry grid.','scrapbook',30,true,'masonry-gallery'),
('gallery-spacing','Memory spacing','Increase spacing between scrapbook photos.','scrapbook',0,false,'gallery-spacing'),
('section-dividers','Scrapbook dividers','Add decorative dividers between memory sections.','scrapbook',0,false,'section-dividers'),
('corner-elements','Corner decorations','Add scrapbook framing elements to page corners.','scrapbook',0,false,'corner-elements'),
('vintage-effect','Vintage photo effect','Give memory photos a vintage printed look.','scrapbook',25,true,'vintage-effect'),
('photo-grain','Photo grain','Add a subtle photographic grain treatment.','scrapbook',0,false,'photo-grain'),
('photo-opacity','Photo opacity','Create faded or layered photo effects.','scrapbook',0,false,'photo-opacity'),
('title-style','Scrapbook title style','Change the visual treatment of the scrapbook title.','scrapbook',0,false,'title-style'),
('page-margins','Scrapbook page margins','Adjust the outer scrapbook page margins.','scrapbook',0,false,'page-margins'),
('card-rotation','Memory card rotation','Rotate memory cards for a handmade layout.','scrapbook',0,false,'card-rotation'),
('scrapbook-frame','Scrapbook frame','Add a layered frame around the scrapbook.','scrapbook',35,true,'scrapbook-frame'),
('quote-cards','Decorative quote cards','Create larger quote cards for meaningful memories.','scrapbook',25,true,'quote-cards')
on conflict(slug) do update set name=excluded.name,description=excluded.description,category=excluded.category,price=excluded.price,is_paid=excluded.is_paid,css_feature=excluded.css_feature;

insert into public.template_features(template_id,feature_id) select t.id,f.id from public.templates t cross join public.features f where f.slug in ('sticky-navigation','mobile-menu','smooth-scroll','scroll-to-top','image-placement','image-size','image-shapes','gallery-captions','gallery-lightbox','section-width','section-spacing','section-alignment','social-links','testimonial-section','contact-section','custom-palette','custom-font-pairing','gallery-layout','gallery-placement','before-after-images','booking-url','google-url','contact-form','faq-section','pricing-section','blog-section','newsletter-section','timeline-section','seo-setup','analytics-tracking') on conflict do nothing;
insert into public.template_features(template_id,feature_id) select t.id,f.id from public.templates t join public.features f on f.slug in ('scrapbook-stickers','scrapbook-washi','scrapbook-paper','scrapbook-polaroids','scrapbook-collage','scrapbook-journal','scrapbook-dates','scrapbook-locations','scrapbook-timeline','scrapbook-guestbook','scrapbook-music','scrapbook-countdown','scrapbook-quote','scrapbook-private','paper-colour','background-texture','notebook-style','torn-edges','tape-decoration','sticker-decorations','photo-shadow','photo-rotation','photo-borders','border-thickness','border-colour','doodles','handwritten-font','caption-handwriting','handwriting-colour','scrapbook-background','custom-sticker','photo-captions','journal-entries','date-stamps','location-stamp','memory-timeline','paper-layouts','photo-collage','masonry-gallery','gallery-spacing','section-dividers','corner-elements','vintage-effect','photo-grain','photo-opacity','title-style','page-margins','card-rotation','scrapbook-frame','quote-cards') where t.slug='scrapbook' on conflict do nothing;

-- Included image policy: first 5 images are free, every extra image costs R15.
-- Website catalog validation expected by the app: 30 general website features = 15 free + 15 paid.
-- Scrapbook catalog validation expected by the app: 50 scrapbook features = 35 free + 15 paid.

alter table public.profiles enable row level security;
alter table public.templates enable row level security; alter table public.features enable row level security; alter table public.template_features enable row level security; alter table public.projects enable row level security; alter table public.project_features enable row level security; alter table public.project_images enable row level security; alter table public.orders enable row level security; alter table public.order_items enable row level security; alter table public.payments enable row level security;

create policy "public can read active templates" on public.templates for select using (active=true);
create policy "public can read active features" on public.features for select using (active=true);
create policy "public can read template features" on public.template_features for select using (true);
create policy "users read own profile" on public.profiles for select using (auth.uid()=id);
create policy "users update own profile" on public.profiles for update using (auth.uid()=id);
create policy "users read own projects" on public.projects for select using (auth.uid()=user_id);
create policy "users create own projects" on public.projects for insert with check (auth.uid()=user_id);
create policy "users update own projects" on public.projects for update using (auth.uid()=user_id);
create policy "users delete own projects" on public.projects for delete using (auth.uid()=user_id);
create policy "users manage own project features" on public.project_features for all using (exists(select 1 from public.projects p where p.id=project_id and p.user_id=auth.uid())) with check (exists(select 1 from public.projects p where p.id=project_id and p.user_id=auth.uid()));
create policy "users manage own images" on public.project_images for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "users read own orders" on public.orders for select using (auth.uid()=user_id);
create policy "users read own order items" on public.order_items for select using (exists(select 1 from public.orders o where o.id=order_id and o.user_id=auth.uid()));
create policy "users read own payments" on public.payments for select using (exists(select 1 from public.orders o where o.id=order_id and o.user_id=auth.uid()));

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(id,email) values(new.id,new.email) on conflict(id) do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users; create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

insert into storage.buckets(id,name,public) values('zapify-project-assets','zapify-project-assets',false) on conflict(id) do nothing;
create policy "users upload project assets" on storage.objects for insert to authenticated with check(bucket_id='zapify-project-assets' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "users read project assets" on storage.objects for select to authenticated using(bucket_id='zapify-project-assets' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "users delete project assets" on storage.objects for delete to authenticated using(bucket_id='zapify-project-assets' and (storage.foldername(name))[1]=auth.uid()::text);
