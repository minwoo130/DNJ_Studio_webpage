--
-- PostgreSQL database dump
--

\restrict K2F11LdzgfkmHMg1SbIBOl0EaMPWQJ7XBCQlkulhe6AUbVL9su7SHKjGtfSnH8v

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_items (
    id integer NOT NULL,
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT cart_items_quantity_check CHECK ((quantity > 0))
);


--
-- Name: cart_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cart_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cart_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cart_items_id_seq OWNED BY public.cart_items.id;


--
-- Name: community_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_comments (
    id integer NOT NULL,
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: community_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.community_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: community_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.community_comments_id_seq OWNED BY public.community_comments.id;


--
-- Name: community_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_posts (
    id integer NOT NULL,
    board_type character varying(20) NOT NULL,
    user_id integer NOT NULL,
    title character varying(200) NOT NULL,
    content text NOT NULL,
    is_private boolean DEFAULT false NOT NULL,
    view_count integer DEFAULT 0 NOT NULL,
    product_id integer,
    rating smallint,
    image_urls text[] DEFAULT '{}'::text[] NOT NULL,
    password_hash character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT community_posts_board_type_check CHECK (((board_type)::text = ANY ((ARRAY['notice'::character varying, 'review'::character varying, 'qna'::character varying, 'exchange'::character varying])::text[]))),
    CONSTRAINT community_posts_rating_check CHECK (((rating IS NULL) OR ((rating >= 1) AND (rating <= 5))))
);


--
-- Name: community_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.community_posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: community_posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.community_posts_id_seq OWNED BY public.community_posts.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    price integer NOT NULL
);


--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id integer,
    guest_name character varying(100),
    guest_phone character varying(20),
    guest_email character varying(255),
    status character varying(20) DEFAULT 'placed'::character varying NOT NULL,
    total_amount integer NOT NULL,
    recipient_name character varying(100) NOT NULL,
    recipient_phone character varying(20) NOT NULL,
    zip_code character varying(10),
    address character varying(255) NOT NULL,
    address_detail character varying(255),
    memo character varying(255),
    is_shipped boolean DEFAULT false NOT NULL,
    shipped_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    price integer NOT NULL,
    original_price integer,
    badge character varying(20),
    sold_label character varying(100),
    category character varying(20) NOT NULL,
    tags text[] DEFAULT '{}'::text[] NOT NULL,
    image_url character varying(500),
    detail_content text DEFAULT ''::text NOT NULL,
    is_weekly_best boolean DEFAULT false NOT NULL,
    is_new_arrival boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    detail_images text[] DEFAULT '{}'::text[] NOT NULL,
    best_order integer,
    new_order integer,
    CONSTRAINT products_best_order_range CHECK (((best_order IS NULL) OR ((best_order >= 1) AND (best_order <= 6)))),
    CONSTRAINT products_new_order_range CHECK (((new_order IS NULL) OR ((new_order >= 1) AND (new_order <= 6))))
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: user_coupons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_coupons (
    id integer NOT NULL,
    user_id integer NOT NULL,
    amount integer NOT NULL,
    reason character varying(100) NOT NULL,
    is_used boolean DEFAULT false NOT NULL,
    issued_at timestamp with time zone DEFAULT now() NOT NULL,
    used_at timestamp with time zone,
    expires_at timestamp with time zone
);


--
-- Name: user_coupons_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_coupons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_coupons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_coupons_id_seq OWNED BY public.user_coupons.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    name character varying(100) NOT NULL,
    phone character varying(20),
    birth_date date,
    region character varying(50),
    zip_code character varying(10),
    address character varying(255),
    address_detail character varying(255),
    is_admin boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: wishlist_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wishlist_items (
    id integer NOT NULL,
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: wishlist_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.wishlist_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: wishlist_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.wishlist_items_id_seq OWNED BY public.wishlist_items.id;


--
-- Name: cart_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items ALTER COLUMN id SET DEFAULT nextval('public.cart_items_id_seq'::regclass);


--
-- Name: community_comments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_comments ALTER COLUMN id SET DEFAULT nextval('public.community_comments_id_seq'::regclass);


--
-- Name: community_posts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_posts ALTER COLUMN id SET DEFAULT nextval('public.community_posts_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: user_coupons id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_coupons ALTER COLUMN id SET DEFAULT nextval('public.user_coupons_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: wishlist_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist_items ALTER COLUMN id SET DEFAULT nextval('public.wishlist_items_id_seq'::regclass);


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cart_items (id, user_id, product_id, quantity, created_at) FROM stdin;
\.


--
-- Data for Name: community_comments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.community_comments (id, post_id, user_id, content, created_at) FROM stdin;
\.


--
-- Data for Name: community_posts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.community_posts (id, board_type, user_id, title, content, is_private, view_count, product_id, rating, image_urls, password_hash, created_at, updated_at) FROM stdin;
1	notice	1	저희 됐어요 ㅈ됬어요	ㅋㅌㅋㅋㅋㅋ	f	6	\N	\N	{}	\N	2026-07-25 03:37:40.97812+00	2026-07-25 03:37:40.97812+00
2	review	1	옷이 빨리 왔져염	옷이 정말 잘맞아요 담에 또사용	f	36	7	5	{/uploads/reviews/1784951463166-9d3a0cb2868b.png}	\N	2026-07-25 03:38:19.644569+00	2026-07-25 03:51:03.964386+00
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, order_id, product_id, quantity, price) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, user_id, guest_name, guest_phone, guest_email, status, total_amount, recipient_name, recipient_phone, zip_code, address, address_detail, memo, is_shipped, shipped_at, created_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, name, price, original_price, badge, sold_label, category, tags, image_url, detail_content, is_weekly_best, is_new_arrival, created_at, detail_images, best_order, new_order) FROM stdin;
17	워싱 데님 반팔 셔츠	36800	49000	추천	\N	TOP	{반팔,셔츠,당일출발}	/uploads/products/1785135391802-75deadbb4f73.jpg		t	t	2026-07-27 07:02:50.930596+00	{/uploads/products/1785135409248-7f1224fcd7b8.png,/uploads/products/1785135435562-efe3b1ebf365.png,/uploads/products/1785135447975-cfb05ef2aab6.jpg,/uploads/products/1785135473538-6525773ff031.jpg,/uploads/products/1785135475990-3a415cd773c5.jpg,/uploads/products/1785135506104-fbd16d295b6a.jpg,/uploads/products/1785135633021-d33caac16638.jpg,/uploads/products/1785135636449-e1526cbc77b5.jpg,/uploads/products/1785135669848-9ab02d29f64d.jpg,/uploads/products/1785135677627-38afd318c784.jpg,/uploads/products/1785135680153-0c72bfbee217.jpg,/uploads/products/1785135684778-378d0365095c.jpg,/uploads/products/1785135687795-47c4e6056dd6.jpg,/uploads/products/1785135694945-a981d93bf146.jpg,/uploads/products/1785135701814-b63e89e67613.jpg,/uploads/products/1785135706072-4000f94dc899.png,/uploads/products/1785135709145-3c4af0dfda6f.png,/uploads/products/1785135749793-55073eb928c9.png}	2	2
12	321312	3213	312231	\N	\N	TOP	{}	/uploads/products/1784956344233-dc07d2da4df3.png		t	t	2026-07-25 05:12:31.134952+00	{}	\N	\N
13	3213	3213	321321	\N	\N	TOP	{}	/uploads/products/1784956369897-18870ddcf871.png		t	t	2026-07-25 05:12:52.044584+00	{}	\N	\N
14	3123	3123	3213	\N	\N	TOP	{가디건}	/uploads/products/1784956389721-d4a2fd4cba30.png		t	t	2026-07-25 05:13:13.001505+00	{}	\N	\N
15	312	312	3213	\N	\N	TOP	{}	/uploads/products/1784956398593-9ad95634521a.png		t	f	2026-07-25 05:13:19.632291+00	{}	\N	\N
11	3123	123	3123	\N	\N	TOP	{반팔,312}	/uploads/products/1784956327829-4acb59841988.png		t	t	2026-07-25 05:12:09.634222+00	{}	\N	\N
7	좆되는옷	19800	25000	추천	\N	TOP	{셔츠}	/uploads/products/1784949754512-46cd9f64d488.jpg	<p></p>	t	t	2026-07-25 02:40:57.660075+00	{/uploads/products/1784950002373-eaba42d555cb.png,/uploads/products/1784950005319-ef1bcb1ac156.png,/uploads/products/1784950007119-ce064736206e.png,/uploads/products/1784950010004-cd4e0918af2a.png,/uploads/products/1784950012008-21228d179aa6.png,/uploads/products/1784950014791-2a3a8ca04d33.png,/uploads/products/1784950016639-70b5e27f28d1.png,/uploads/products/1784950018207-da05faf15ebf.png}	1	1
\.


--
-- Data for Name: user_coupons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_coupons (id, user_id, amount, reason, is_used, issued_at, used_at, expires_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password_hash, name, phone, birth_date, region, zip_code, address, address_detail, is_admin, is_active, created_at) FROM stdin;
1	ldh09069674	$2a$10$eiAovWjSq2EM/ml7hZRB6OZpNe2MrCyBDd.OTahAOsywd3Fq9EPye	관리자	\N	\N	\N	\N	\N	\N	t	t	2026-07-25 02:18:17.147009+00
\.


--
-- Data for Name: wishlist_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wishlist_items (id, user_id, product_id, created_at) FROM stdin;
\.


--
-- Name: cart_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cart_items_id_seq', 1, false);


--
-- Name: community_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.community_comments_id_seq', 1, false);


--
-- Name: community_posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.community_posts_id_seq', 5, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_items_id_seq', 1, false);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.orders_id_seq', 1, false);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.products_id_seq', 17, true);


--
-- Name: user_coupons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_coupons_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: wishlist_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.wishlist_items_id_seq', 1, false);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: cart_items cart_items_user_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_user_id_product_id_key UNIQUE (user_id, product_id);


--
-- Name: community_comments community_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_comments
    ADD CONSTRAINT community_comments_pkey PRIMARY KEY (id);


--
-- Name: community_posts community_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_posts
    ADD CONSTRAINT community_posts_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: user_coupons user_coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_coupons
    ADD CONSTRAINT user_coupons_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: wishlist_items wishlist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_pkey PRIMARY KEY (id);


--
-- Name: wishlist_items wishlist_items_user_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_user_id_product_id_key UNIQUE (user_id, product_id);


--
-- Name: idx_cart_items_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cart_items_user_id ON public.cart_items USING btree (user_id);


--
-- Name: idx_community_comments_post_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_community_comments_post_id ON public.community_comments USING btree (post_id);


--
-- Name: idx_community_posts_board_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_community_posts_board_type ON public.community_posts USING btree (board_type, id DESC);


--
-- Name: idx_community_posts_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_community_posts_product_id ON public.community_posts USING btree (product_id);


--
-- Name: idx_community_posts_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_community_posts_user_id ON public.community_posts USING btree (user_id);


--
-- Name: idx_order_items_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);


--
-- Name: idx_order_items_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_items_product_id ON public.order_items USING btree (product_id);


--
-- Name: idx_orders_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);


--
-- Name: idx_products_best_order_uniq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_products_best_order_uniq ON public.products USING btree (best_order) WHERE (best_order IS NOT NULL);


--
-- Name: idx_products_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_category ON public.products USING btree (category);


--
-- Name: idx_products_new_order_uniq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_products_new_order_uniq ON public.products USING btree (new_order) WHERE (new_order IS NOT NULL);


--
-- Name: idx_products_tags; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_tags ON public.products USING gin (tags);


--
-- Name: idx_user_coupons_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_coupons_user_id ON public.user_coupons USING btree (user_id);


--
-- Name: idx_wishlist_items_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wishlist_items_user_id ON public.wishlist_items USING btree (user_id);


--
-- Name: cart_items cart_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: community_comments community_comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_comments
    ADD CONSTRAINT community_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.community_posts(id) ON DELETE CASCADE;


--
-- Name: community_comments community_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_comments
    ADD CONSTRAINT community_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: community_posts community_posts_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_posts
    ADD CONSTRAINT community_posts_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: community_posts community_posts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_posts
    ADD CONSTRAINT community_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_coupons user_coupons_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_coupons
    ADD CONSTRAINT user_coupons_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: wishlist_items wishlist_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: wishlist_items wishlist_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict K2F11LdzgfkmHMg1SbIBOl0EaMPWQJ7XBCQlkulhe6AUbVL9su7SHKjGtfSnH8v

