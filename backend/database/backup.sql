--
-- PostgreSQL database dump
--

\restrict ITaY2WhFGBgBDMVhgUYwJqIxsnjWe875uZbc83lBPRcnxH4ebN7XbKDhO3qopdN

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

ALTER TABLE IF EXISTS ONLY public.wishlist_items DROP CONSTRAINT IF EXISTS wishlist_items_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.wishlist_items DROP CONSTRAINT IF EXISTS wishlist_items_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_coupons DROP CONSTRAINT IF EXISTS user_coupons_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.product_relations DROP CONSTRAINT IF EXISTS product_relations_related_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.product_relations DROP CONSTRAINT IF EXISTS product_relations_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_coupon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.mileage_transactions DROP CONSTRAINT IF EXISTS mileage_transactions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.mileage_transactions DROP CONSTRAINT IF EXISTS mileage_transactions_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.community_posts DROP CONSTRAINT IF EXISTS community_posts_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.community_posts DROP CONSTRAINT IF EXISTS community_posts_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.community_comments DROP CONSTRAINT IF EXISTS community_comments_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.community_comments DROP CONSTRAINT IF EXISTS community_comments_post_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cart_items DROP CONSTRAINT IF EXISTS cart_items_product_id_fkey;
DROP INDEX IF EXISTS public.idx_wishlist_items_user_id;
DROP INDEX IF EXISTS public.idx_user_coupons_user_id;
DROP INDEX IF EXISTS public.idx_products_tags;
DROP INDEX IF EXISTS public.idx_products_new_order_uniq;
DROP INDEX IF EXISTS public.idx_products_hero_slot_uniq;
DROP INDEX IF EXISTS public.idx_products_category;
DROP INDEX IF EXISTS public.idx_products_best_order_uniq;
DROP INDEX IF EXISTS public.idx_product_relations_related;
DROP INDEX IF EXISTS public.idx_orders_user_id;
DROP INDEX IF EXISTS public.idx_order_items_product_id;
DROP INDEX IF EXISTS public.idx_order_items_order_id;
DROP INDEX IF EXISTS public.idx_notifications_user_id;
DROP INDEX IF EXISTS public.idx_mileage_transactions_user_id;
DROP INDEX IF EXISTS public.idx_community_posts_user_id;
DROP INDEX IF EXISTS public.idx_community_posts_product_id;
DROP INDEX IF EXISTS public.idx_community_posts_board_type;
DROP INDEX IF EXISTS public.idx_community_comments_post_id;
DROP INDEX IF EXISTS public.idx_cart_items_user_product_variant;
DROP INDEX IF EXISTS public.idx_cart_items_user_id;
ALTER TABLE IF EXISTS ONLY public.wishlist_items DROP CONSTRAINT IF EXISTS wishlist_items_user_id_product_id_key;
ALTER TABLE IF EXISTS ONLY public.wishlist_items DROP CONSTRAINT IF EXISTS wishlist_items_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.user_coupons DROP CONSTRAINT IF EXISTS user_coupons_pkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_pkey;
ALTER TABLE IF EXISTS ONLY public.product_relations DROP CONSTRAINT IF EXISTS product_relations_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.mileage_transactions DROP CONSTRAINT IF EXISTS mileage_transactions_pkey;
ALTER TABLE IF EXISTS ONLY public.community_posts DROP CONSTRAINT IF EXISTS community_posts_pkey;
ALTER TABLE IF EXISTS ONLY public.community_comments DROP CONSTRAINT IF EXISTS community_comments_pkey;
ALTER TABLE IF EXISTS ONLY public.cart_items DROP CONSTRAINT IF EXISTS cart_items_pkey;
ALTER TABLE IF EXISTS public.wishlist_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_coupons ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.products ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.orders ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.order_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.notifications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.mileage_transactions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.community_posts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.community_comments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.cart_items ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.wishlist_items_id_seq;
DROP TABLE IF EXISTS public.wishlist_items;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.user_coupons_id_seq;
DROP TABLE IF EXISTS public.user_coupons;
DROP SEQUENCE IF EXISTS public.products_id_seq;
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.product_relations;
DROP SEQUENCE IF EXISTS public.orders_id_seq;
DROP TABLE IF EXISTS public.orders;
DROP SEQUENCE IF EXISTS public.order_items_id_seq;
DROP TABLE IF EXISTS public.order_items;
DROP SEQUENCE IF EXISTS public.notifications_id_seq;
DROP TABLE IF EXISTS public.notifications;
DROP SEQUENCE IF EXISTS public.mileage_transactions_id_seq;
DROP TABLE IF EXISTS public.mileage_transactions;
DROP SEQUENCE IF EXISTS public.community_posts_id_seq;
DROP TABLE IF EXISTS public.community_posts;
DROP SEQUENCE IF EXISTS public.community_comments_id_seq;
DROP TABLE IF EXISTS public.community_comments;
DROP SEQUENCE IF EXISTS public.cart_items_id_seq;
DROP TABLE IF EXISTS public.cart_items;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: dnjstudio
--

CREATE TABLE public.cart_items (
    id integer NOT NULL,
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    color character varying(50) DEFAULT ''::character varying NOT NULL,
    size character varying(50) DEFAULT ''::character varying NOT NULL,
    CONSTRAINT cart_items_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE public.cart_items OWNER TO dnjstudio;

--
-- Name: cart_items_id_seq; Type: SEQUENCE; Schema: public; Owner: dnjstudio
--

CREATE SEQUENCE public.cart_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cart_items_id_seq OWNER TO dnjstudio;

--
-- Name: cart_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dnjstudio
--

ALTER SEQUENCE public.cart_items_id_seq OWNED BY public.cart_items.id;


--
-- Name: community_comments; Type: TABLE; Schema: public; Owner: dnjstudio
--

CREATE TABLE public.community_comments (
    id integer NOT NULL,
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.community_comments OWNER TO dnjstudio;

--
-- Name: community_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: dnjstudio
--

CREATE SEQUENCE public.community_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.community_comments_id_seq OWNER TO dnjstudio;

--
-- Name: community_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dnjstudio
--

ALTER SEQUENCE public.community_comments_id_seq OWNED BY public.community_comments.id;


--
-- Name: community_posts; Type: TABLE; Schema: public; Owner: dnjstudio
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


ALTER TABLE public.community_posts OWNER TO dnjstudio;

--
-- Name: community_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: dnjstudio
--

CREATE SEQUENCE public.community_posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.community_posts_id_seq OWNER TO dnjstudio;

--
-- Name: community_posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dnjstudio
--

ALTER SEQUENCE public.community_posts_id_seq OWNED BY public.community_posts.id;


--
-- Name: mileage_transactions; Type: TABLE; Schema: public; Owner: dnjstudio
--

CREATE TABLE public.mileage_transactions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    amount integer NOT NULL,
    reason character varying(100) NOT NULL,
    order_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.mileage_transactions OWNER TO dnjstudio;

--
-- Name: mileage_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: dnjstudio
--

CREATE SEQUENCE public.mileage_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mileage_transactions_id_seq OWNER TO dnjstudio;

--
-- Name: mileage_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dnjstudio
--

ALTER SEQUENCE public.mileage_transactions_id_seq OWNED BY public.mileage_transactions.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: dnjstudio
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    order_id integer,
    message text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notifications OWNER TO dnjstudio;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: dnjstudio
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO dnjstudio;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dnjstudio
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: dnjstudio
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    price integer NOT NULL,
    color character varying(50) DEFAULT ''::character varying NOT NULL,
    size character varying(50) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE public.order_items OWNER TO dnjstudio;

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: dnjstudio
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO dnjstudio;

--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dnjstudio
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: dnjstudio
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
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    payment_method character varying(20) DEFAULT 'BANK_TRANSFER'::character varying NOT NULL,
    payment_status character varying(20) DEFAULT 'WAITING'::character varying NOT NULL,
    depositor_name character varying(100),
    deposit_deadline timestamp with time zone,
    paid_at timestamp with time zone,
    coupon_id integer,
    discount_amount integer DEFAULT 0 NOT NULL,
    subtotal_amount integer DEFAULT 0 NOT NULL,
    courier_company character varying(50),
    tracking_number character varying(50),
    cancel_requested boolean DEFAULT false NOT NULL,
    cancel_requested_at timestamp with time zone,
    mileage_used integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.orders OWNER TO dnjstudio;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: dnjstudio
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO dnjstudio;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dnjstudio
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: product_relations; Type: TABLE; Schema: public; Owner: dnjstudio
--

CREATE TABLE public.product_relations (
    product_id integer NOT NULL,
    related_product_id integer NOT NULL,
    CONSTRAINT product_relations_check CHECK ((product_id <> related_product_id))
);


ALTER TABLE public.product_relations OWNER TO dnjstudio;

--
-- Name: products; Type: TABLE; Schema: public; Owner: dnjstudio
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
    colors text[] DEFAULT '{}'::text[] NOT NULL,
    sizes text[] DEFAULT '{}'::text[] NOT NULL,
    image_urls text[] DEFAULT '{}'::text[] NOT NULL,
    origin character varying(100),
    summary character varying(300),
    hero_slot character varying(20),
    CONSTRAINT products_best_order_range CHECK (((best_order IS NULL) OR ((best_order >= 1) AND (best_order <= 6)))),
    CONSTRAINT products_hero_slot_check CHECK (((hero_slot)::text = ANY ((ARRAY['new_arrival'::character varying, 'best_item'::character varying])::text[]))),
    CONSTRAINT products_new_order_range CHECK (((new_order IS NULL) OR ((new_order >= 1) AND (new_order <= 6))))
);


ALTER TABLE public.products OWNER TO dnjstudio;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: dnjstudio
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO dnjstudio;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dnjstudio
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: user_coupons; Type: TABLE; Schema: public; Owner: dnjstudio
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


ALTER TABLE public.user_coupons OWNER TO dnjstudio;

--
-- Name: user_coupons_id_seq; Type: SEQUENCE; Schema: public; Owner: dnjstudio
--

CREATE SEQUENCE public.user_coupons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_coupons_id_seq OWNER TO dnjstudio;

--
-- Name: user_coupons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dnjstudio
--

ALTER SEQUENCE public.user_coupons_id_seq OWNED BY public.user_coupons.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: dnjstudio
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


ALTER TABLE public.users OWNER TO dnjstudio;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: dnjstudio
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO dnjstudio;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dnjstudio
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: wishlist_items; Type: TABLE; Schema: public; Owner: dnjstudio
--

CREATE TABLE public.wishlist_items (
    id integer NOT NULL,
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.wishlist_items OWNER TO dnjstudio;

--
-- Name: wishlist_items_id_seq; Type: SEQUENCE; Schema: public; Owner: dnjstudio
--

CREATE SEQUENCE public.wishlist_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wishlist_items_id_seq OWNER TO dnjstudio;

--
-- Name: wishlist_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dnjstudio
--

ALTER SEQUENCE public.wishlist_items_id_seq OWNED BY public.wishlist_items.id;


--
-- Name: cart_items id; Type: DEFAULT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.cart_items ALTER COLUMN id SET DEFAULT nextval('public.cart_items_id_seq'::regclass);


--
-- Name: community_comments id; Type: DEFAULT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.community_comments ALTER COLUMN id SET DEFAULT nextval('public.community_comments_id_seq'::regclass);


--
-- Name: community_posts id; Type: DEFAULT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.community_posts ALTER COLUMN id SET DEFAULT nextval('public.community_posts_id_seq'::regclass);


--
-- Name: mileage_transactions id; Type: DEFAULT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.mileage_transactions ALTER COLUMN id SET DEFAULT nextval('public.mileage_transactions_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: user_coupons id; Type: DEFAULT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.user_coupons ALTER COLUMN id SET DEFAULT nextval('public.user_coupons_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: wishlist_items id; Type: DEFAULT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.wishlist_items ALTER COLUMN id SET DEFAULT nextval('public.wishlist_items_id_seq'::regclass);


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: dnjstudio
--

COPY public.cart_items (id, user_id, product_id, quantity, created_at, color, size) FROM stdin;
\.


--
-- Data for Name: community_comments; Type: TABLE DATA; Schema: public; Owner: dnjstudio
--

COPY public.community_comments (id, post_id, user_id, content, created_at) FROM stdin;
\.


--
-- Data for Name: community_posts; Type: TABLE DATA; Schema: public; Owner: dnjstudio
--

COPY public.community_posts (id, board_type, user_id, title, content, is_private, view_count, product_id, rating, image_urls, password_hash, created_at, updated_at) FROM stdin;
10	exchange	1	RETURN & EXCHANGE	교환 및 반품 주소\n(02084) 서울 중랑구 신내로 7나길 24 209동 1004호\n\n반품 접수 시 별도 안내\n※ 임의로 상품을 발송하실 경우 반송될 수 있으니 반드시 고객센터를 통해 접수 후 진행해 주시기 바랍니다.\n----------------------------------------------------------------------------------------------------------------------\n교환 및 반품 가능 기간\n\n· 상품 수령일로부터 3일 이내 신청 가능합니다.\n· 상품 불량 또는 오배송의 경우 수령일로부터 7일 이내 접수 가능합니다.\n----------------------------------------------------------------------------------------------------------------------\n교환 및 반품이 가능한 경우\n\n· 상품이 표시·광고 내용과 다르거나 불량 및 오배송된 경우\n· 상품 수령 후 7일 이내 미사용 상태로 보관 중인 경우\n----------------------------------------------------------------------------------------------------------------------\n교환 및 반품이 불가능한 경우\n\n· 상품 수령 후 7일이 경과한 경우\n· 착용, 세탁, 향수 및 화장품 냄새 등 사용 흔적이 있는 경우\n· 상품 훼손 및 오염이 발생한 경우\n· 택(Tag) 제거 및 구성품이 누락된 경우\n· 고객 부주의로 상품 가치가 훼손된 경우\n----------------------------------------------------------------------------------------------------------------------\n반품 배송비\n\n· 단순 변심 반품: 왕복 배송비 고객 부담\n· 색상 및 사이즈 교환: 왕복 배송비 고객 부담\n· 불량 및 오배송: 판매자 부담	f	8	\N	\N	{}	\N	2026-08-04 14:22:00.986249+00	2026-08-04 14:22:00.986249+00
2	review	1	옷이 빨리 왔져염	옷이 정말 잘맞아요 담에 또사용	f	50	\N	5	{/uploads/reviews/1784951463166-9d3a0cb2868b.png}	\N	2026-07-25 03:38:19.644569+00	2026-07-25 03:51:03.964386+00
1	notice	1	오픈 대기중 ㄷㄱㄷㄱ	ㄷㄱㄷㄱ	f	26	\N	\N	{}	\N	2026-07-25 03:37:40.97812+00	2026-07-27 13:26:47.194589+00
\.


--
-- Data for Name: mileage_transactions; Type: TABLE DATA; Schema: public; Owner: dnjstudio
--

COPY public.mileage_transactions (id, user_id, amount, reason, order_id, created_at) FROM stdin;
1	2	993	purchase	\N	2026-08-04 13:40:21.42469+00
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: dnjstudio
--

COPY public.notifications (id, user_id, order_id, message, is_read, created_at) FROM stdin;
7	2	\N	주문 #9 입금이 확인되어 상품 준비중입니다.	t	2026-07-27 14:59:50.84306+00
8	2	\N	주문 #9 배송이 시작되었습니다. (CJ대한통운 123)	t	2026-07-27 15:00:01.492477+00
5	2	\N	주문 #7 입금이 확인되어 상품 준비중입니다.	t	2026-07-27 13:35:30.206861+00
4	2	\N	주문 #5 입금이 확인되어 상품 준비중입니다.	t	2026-07-27 08:23:01.460885+00
12	7	13	주문 #13이(가) 입금기한 초과로 자동 취소되었습니다.	f	2026-08-03 10:46:51.276324+00
14	2	\N	주문 #14 배송이 시작되었습니다. (CJ대한통운 11111)	t	2026-08-04 13:40:26.08735+00
13	2	\N	주문 #14 입금이 확인되어 상품 준비중입니다. (적립금 993원 적립)	t	2026-08-04 13:40:21.42469+00
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: dnjstudio
--

COPY public.order_items (id, order_id, product_id, quantity, price, color, size) FROM stdin;
13	13	17	1	36800	진청	FREE
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: dnjstudio
--

COPY public.orders (id, user_id, guest_name, guest_phone, guest_email, status, total_amount, recipient_name, recipient_phone, zip_code, address, address_detail, memo, is_shipped, shipped_at, created_at, payment_method, payment_status, depositor_name, deposit_deadline, paid_at, coupon_id, discount_amount, subtotal_amount, courier_company, tracking_number, cancel_requested, cancel_requested_at, mileage_used) FROM stdin;
13	7	\N	\N	\N	cancelled	33800	이동화	01064707857	01871	서울 노원구 월계동 911-8	301	\N	f	\N	2026-07-27 15:16:03.066151+00	BANK_TRANSFER	CANCELLED	이동화	2026-07-30 15:16:03.066151+00	\N	6	3000	36800	\N	\N	f	\N	0
\.


--
-- Data for Name: product_relations; Type: TABLE DATA; Schema: public; Owner: dnjstudio
--

COPY public.product_relations (product_id, related_product_id) FROM stdin;
28	20
20	28
28	26
26	28
28	22
22	28
18	20
20	18
18	22
22	18
21	20
20	21
22	17
17	22
23	22
22	23
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: dnjstudio
--

COPY public.products (id, name, price, original_price, badge, sold_label, category, tags, image_url, detail_content, is_weekly_best, is_new_arrival, created_at, detail_images, best_order, new_order, colors, sizes, image_urls, origin, summary, hero_slot) FROM stdin;
21	빈티지 워싱 카모 포켓반팔	35800	40800	\N	\N	TOP	{반팔}	/uploads/products/1785754338491-eba738ebffc3.jpg	<p>PRODUCT INFORMATION</p><p>* 제품 사이즈는 측정 방법과 위치에 따라 1~3cm 정도의 오차가 발생할 수 있습니다.</p><p>* 모니터 해상도와 촬영 환경에 따라 실제 제품과 미세한 색상 차이가 있을 수 있습니다.</p><p>* 위 사유는 제품 불량에 해당하지 않아 무상 교환·반품이 어렵습니다. 단, 배송비 부담 시 교환·반품이 가능합니다.</p><p>* 밝은 색상과 화이트 계열 및 린넨 소재는 원단 특성상 약간의 비침이 있을 수 있습니다.</p><p>* 제품의 변형과 물 빠짐을 최소화하기 위해 단독 손세탁을 권장하며, 컬러 제품은 흰색 제품과 분리하여 세탁해 주세요.</p><p>* 어두운 색상과 데님 제품은 원단 특성상 착용 또는 세탁 과정에서 물 빠짐과 이염이 발생할 수 있으니 밝은 색상의 의류 및 소품과 함께 착용할 때 주의해 주세요.</p><p>제조사 · DNJ STUDIO 협력업체</p><p>제조국 · 대한민국</p><p>제조연월 · 주문일 기준 6개월 이내 제조</p><p>품질보증기준 · 제품 이상 발생 시 공정거래위원회 고시 소비자분쟁해결기준에 따라 보상</p><p>A/S 및 고객문의 · 카카오톡 채널 : 디앤제이스튜디오 / 인스타 DM : dnj_studio_</p>	f	t	2026-08-03 10:54:20.975487+00	{/uploads/products/1785754343474-be8ebedd59bd.png,/uploads/products/1785754345630-7c85b4ab9f8f.png,/uploads/products/1785754361599-9fbe65a5a0f3.jpg,/uploads/products/1785754368141-db53b75d1b04.jpg,/uploads/products/1785754370701-34e0d9a91556.jpg,/uploads/products/1785754378411-88f969bf3749.jpg,/uploads/products/1785754381584-4b08827802f8.jpg,/uploads/products/1785754384939-f35f94f7589c.jpg,/uploads/products/1785754387521-77ca61d071b2.jpg,/uploads/products/1785754392907-29d80f346c16.jpg,/uploads/products/1785754395852-698842d3a30d.jpg,/uploads/products/1785754398834-970cc8f556fc.jpg,/uploads/products/1785754402283-63d7dc3c5ec6.jpg,/uploads/products/1785754404617-41d54e38e16f.jpg,/uploads/products/1785754406780-96c445eb4686.jpg,/uploads/products/1785754408907-53df553b0c1b.jpg,/uploads/products/1785754417656-83b3f624ed8c.png,/uploads/products/1785754420326-54f29bba5996.png,/uploads/products/1785754431116-9e472676f98a.png,/uploads/products/1785754434994-cc1fbc2aab50.png,/uploads/products/1785754437308-41845bb44678.png,/uploads/products/1785754440426-3279c212e9e7.png}	\N	\N	{카키,베이지}	{FREE}	{/uploads/products/1785754338491-eba738ebffc3.jpg,/uploads/products/1785910464005-0a7a0c9d7c53.jpg,/uploads/products/1785910482757-fd1d90700be6.jpg}	\N	가슴 포켓의 버튼 디테일로 유니크한 포인트를 더하고, 빈티지한 카모 패턴으로 남성적인 무드 완성	\N
18	골지 헨리넥 반팔티	22800	30000	추천	\N	TOP	{반팔}	/uploads/products/1785154500383-6b9a0ffb86ae.png	<p>PRODUCT INFORMATION</p><p>* 제품 사이즈는 측정 방법과 위치에 따라 1~3cm 정도의 오차가 발생할 수 있습니다.</p><p>* 모니터 해상도와 촬영 환경에 따라 실제 제품과 미세한 색상 차이가 있을 수 있습니다.</p><p>* 위 사유는 제품 불량에 해당하지 않아 무상 교환·반품이 어렵습니다. 단, 배송비 부담 시 교환·반품이 가능합니다.</p><p>* 밝은 색상과 화이트 계열 및 린넨 소재는 원단 특성상 약간의 비침이 있을 수 있습니다.</p><p>* 제품의 변형과 물 빠짐을 최소화하기 위해 단독 손세탁을 권장하며, 컬러 제품은 흰색 제품과 분리하여 세탁해 주세요.</p><p>* 어두운 색상과 데님 제품은 원단 특성상 착용 또는 세탁 과정에서 물 빠짐과 이염이 발생할 수 있으니 밝은 색상의 의류 및 소품과 함께 착용할 때 주의해 주세요.</p><p>제조사 · DNJ STUDIO 협력업체</p><p>제조국 · 대한민국</p><p>제조연월 · 주문일 기준 6개월 이내 제조</p><p>품질보증기준 · 제품 이상 발생 시 공정거래위원회 고시 소비자분쟁해결기준에 따라 보상</p><p>A/S 및 고객문의 · 카카오톡 채널 : 디앤제이스튜디오 / 인스타 DM : dnj_studio_</p><p></p><p></p>	t	f	2026-07-27 12:29:37.699048+00	{/uploads/products/1785155101885-12b592dcf7e3.png,/uploads/products/1785155103597-86a990f1865d.png,/uploads/products/1785155111035-8518873e3633.jpg,/uploads/products/1785155115610-b6f74f9d6f24.jpg,/uploads/products/1785155118261-fd9804f8215c.jpg,/uploads/products/1785155122647-52f8025f436a.jpg,/uploads/products/1785155125704-dc4652a60977.jpg,/uploads/products/1785155128276-ccdb40866a2f.jpg,/uploads/products/1785155131192-d86774339e1e.jpg,/uploads/products/1785161695866-4835d02383eb.png,/uploads/products/1785754065386-dfaa4a1f91eb.jpg,/uploads/products/1785754068774-48eae5669627.jpg,/uploads/products/1785754072190-3eb3f6ff4553.jpg,/uploads/products/1785754074342-a50cd7b093db.jpg,/uploads/products/1785155137294-75960ce77567.png,/uploads/products/1785155141096-907fb6467ef9.png,/uploads/products/1785155342206-87542fc6d434.png,/uploads/products/1785155344299-69dc63cfd2a0.png,/uploads/products/1785155347735-8b7ac9fc734d.png,/uploads/products/1785155350169-191cbf6fbac0.png,/uploads/products/1785155352453-7eac82f9898d.png,/uploads/products/1785155354728-65599207846b.png,/uploads/products/1785155729935-7d030990780d.png,/uploads/products/1785155360071-2685ad676d26.png,/uploads/products/1785155363463-b063e907fc0f.png}	2	\N	{화이트,블랙,버건디,그레이,카키,네이비}	{FREE}	{/uploads/products/1785154500383-6b9a0ffb86ae.png,/uploads/products/1785910032187-d0169823f55c.jpg}	\N	스냅 버튼 헨리넥 디테일로 캐주얼한 무드와 남성적인 넥라인을 동시에 연출	\N
20	더블 벨트 워싱 와이드 데님 팬츠	64000	73700	추천	\N	BOTTOM	{데님}	/uploads/products/1785753771050-a3493d3b7902.jpg	<p>PRODUCT INFORMATION</p><p>* 제품 사이즈는 측정 방법과 위치에 따라 1~3cm 정도의 오차가 발생할 수 있습니다.</p><p>* 모니터 해상도와 촬영 환경에 따라 실제 제품과 미세한 색상 차이가 있을 수 있습니다.</p><p>* 위 사유는 제품 불량에 해당하지 않아 무상 교환·반품이 어렵습니다. 단, 배송비 부담 시 교환·반품이 가능합니다.</p><p>* 밝은 색상과 화이트 계열 및 린넨 소재는 원단 특성상 약간의 비침이 있을 수 있습니다.</p><p>* 제품의 변형과 물 빠짐을 최소화하기 위해 단독 손세탁을 권장하며, 컬러 제품은 흰색 제품과 분리하여 세탁해 주세요.</p><p>* 어두운 색상과 데님 제품은 원단 특성상 착용 또는 세탁 과정에서 물 빠짐과 이염이 발생할 수 있으니 밝은 색상의 의류 및 소품과 함께 착용할 때 주의해 주세요.</p><p>제조사 · DNJ STUDIO 협력업체</p><p>제조국 · 대한민국</p><p>제조연월 · 주문일 기준 6개월 이내 제조</p><p>품질보증기준 · 제품 이상 발생 시 공정거래위원회 고시 소비자분쟁해결기준에 따라 보상</p><p>A/S 및 고객문의 · 카카오톡 채널 : 디앤제이스튜디오 / 인스타 DM : dnj_studio_</p>	t	f	2026-08-03 10:45:09.967677+00	{/uploads/products/1785753778125-e94c78b46356.png,/uploads/products/1785753780527-d3c0c4f4ef63.png,/uploads/products/1785753813733-794dc0082d43.jpg,/uploads/products/1785753816587-ddcec34d3a2d.jpg,/uploads/products/1785753822387-bc4cb9b37224.jpg,/uploads/products/1785753826856-398861b6a6d2.jpg,/uploads/products/1785753829723-4f05e8bfaca8.jpg,/uploads/products/1785753832693-319fecead1f6.jpg,/uploads/products/1785753838689-3ce3bed09188.jpg,/uploads/products/1785753851437-1ccc8abef3ff.jpg,/uploads/products/1785753855018-421ddec2516f.jpg,/uploads/products/1785753858681-04cde19cd89e.jpg,/uploads/products/1785753861818-20f0c743bd4e.jpg,/uploads/products/1785753865088-af95f0debc2d.jpg,/uploads/products/1785753872117-5d2ac526a5e5.png,/uploads/products/1785753874976-9e700b6c76dc.png,/uploads/products/1785753878836-ad20642fd2e2.png,/uploads/products/1785753885382-2bad5cc79223.png,/uploads/products/1785753890055-6ae5aa83d5c6.png,/uploads/products/1785753893649-efb375493c01.png,/uploads/products/1785753896940-000998a58f9a.png,/uploads/products/1785753900980-ef8eebb27a49.png}	\N	\N	{그레이,베이지}	{S,M,L}	{/uploads/products/1785753771050-a3493d3b7902.jpg,/uploads/products/1785910308862-d8055faf6eac.jpg,/uploads/products/1785910317842-780dc439fe90.jpg}	\N	더블 벨트 포인트와 빈티지한 워싱감이 어우러져 트렌디한 와이드 스타일 완성	\N
17	워싱 데님 반팔 셔츠	39700	51800	추천	\N	TOP	{셔츠}	/uploads/products/1785139912439-cd4723eeecbf.jpg	<p>PRODUCT INFORMATION</p><p>* 제품 사이즈는 측정 방법과 위치에 따라 1~3cm 정도의 오차가 발생할 수 있습니다.</p><p>* 모니터 해상도와 촬영 환경에 따라 실제 제품과 미세한 색상 차이가 있을 수 있습니다.</p><p>* 위 사유는 제품 불량에 해당하지 않아 무상 교환·반품이 어렵습니다. 단, 배송비 부담 시 교환·반품이 가능합니다.</p><p>* 밝은 색상과 화이트 계열 및 린넨 소재는 원단 특성상 약간의 비침이 있을 수 있습니다.</p><p>* 제품의 변형과 물 빠짐을 최소화하기 위해 단독 손세탁을 권장하며, 컬러 제품은 흰색 제품과 분리하여 세탁해 주세요.</p><p>* 어두운 색상과 데님 제품은 원단 특성상 착용 또는 세탁 과정에서 물 빠짐과 이염이 발생할 수 있으니 밝은 색상의 의류 및 소품과 함께 착용할 때 주의해 주세요.</p><p>제조사 · DNJ STUDIO 협력업체</p><p>제조국 · 중국</p><p>제조연월 · 주문일 기준 6개월 이내 제조</p><p>품질보증기준 · 제품 이상 발생 시 공정거래위원회 고시 소비자분쟁해결기준에 따라 보상</p><p>A/S 및 고객문의 · 카카오톡 채널 : 디앤제이스튜디오 / 인스타 DM : dnj_studio_</p><p></p>	t	f	2026-07-27 07:02:50.930596+00	{/uploads/products/1785135409248-7f1224fcd7b8.png,/uploads/products/1785155481752-eaf8a154a078.png,/uploads/products/1785135447975-cfb05ef2aab6.jpg,/uploads/products/1785135473538-6525773ff031.jpg,/uploads/products/1785135475990-3a415cd773c5.jpg,/uploads/products/1785135506104-fbd16d295b6a.jpg,/uploads/products/1785139889032-0c5dee2b329b.jpg,/uploads/products/1785135633021-d33caac16638.jpg,/uploads/products/1785135636449-e1526cbc77b5.jpg,/uploads/products/1785135680153-0c72bfbee217.jpg,/uploads/products/1785135669848-9ab02d29f64d.jpg,/uploads/products/1785135677627-38afd318c784.jpg,/uploads/products/1785135684778-378d0365095c.jpg,/uploads/products/1785135687795-47c4e6056dd6.jpg,/uploads/products/1785135694945-a981d93bf146.jpg,/uploads/products/1785135701814-b63e89e67613.jpg,/uploads/products/1785139908652-f457df925cb1.png,/uploads/products/1785155559948-12a36e423dff.png,/uploads/products/1785139906014-3a33f9c58930.png,/uploads/products/1785155479387-cc1e4705810a.png,/uploads/products/1785155472149-f15b2b49524c.png,/uploads/products/1785155447589-1e4b9a8974fa.png,/uploads/products/1785155475783-ebd3b7e1db44.png}	1	\N	{진청,흑청}	{FREE}	{/uploads/products/1785139912439-cd4723eeecbf.jpg,/uploads/products/1785847995544-b066d7624cd2.jpg,/uploads/products/1785848005853-5b788488f132.jpg}	중국	소매 버튼 디테일로 캐주얼한 무드와 탄탄한 머슬핏을 동시에 연출	new_arrival
23	피그먼트 스냅 웨스턴 반팔 셔츠	40900	58000	\N	\N	TOP	{셔츠}	/uploads/products/1785833788088-2a9b5193f3ba.jpg	<p>PRODUCT INFORMATION</p><p>* 제품 사이즈는 측정 방법과 위치에 따라 1~3cm 정도의 오차가 발생할 수 있습니다.</p><p>* 모니터 해상도와 촬영 환경에 따라 실제 제품과 미세한 색상 차이가 있을 수 있습니다.</p><p>* 위 사유는 제품 불량에 해당하지 않아 무상 교환·반품이 어렵습니다. 단, 배송비 부담 시 교환·반품이 가능합니다.</p><p>* 밝은 색상과 화이트 계열 및 린넨 소재는 원단 특성상 약간의 비침이 있을 수 있습니다.</p><p>* 제품의 변형과 물 빠짐을 최소화하기 위해 단독 손세탁을 권장하며, 컬러 제품은 흰색 제품과 분리하여 세탁해 주세요.</p><p>* 어두운 색상과 데님 제품은 원단 특성상 착용 또는 세탁 과정에서 물 빠짐과 이염이 발생할 수 있으니 밝은 색상의 의류 및 소품과 함께 착용할 때 주의해 주세요.</p><p>제조사 · DNJ STUDIO 협력업체</p><p>제조국 · 대한민국</p><p>제조연월 · 주문일 기준 6개월 이내 제조</p><p>품질보증기준 · 제품 이상 발생 시 공정거래위원회 고시 소비자분쟁해결기준에 따라 보상</p><p>A/S 및 고객문의 · 카카오톡 채널 : 디앤제이스튜디오 / 인스타 DM : dnj_studio_</p>	f	t	2026-08-04 09:11:04.938978+00	{/uploads/products/1785834578431-c68d6d0c8956.png,/uploads/products/1785834581872-f0e975529f2b.png,/uploads/products/1785834585752-3085d5d364ef.jpg,/uploads/products/1785834599916-cf994e236059.jpg,/uploads/products/1785834602660-43045ae09f9a.jpg,/uploads/products/1785834605362-d2238b6aee02.jpg,/uploads/products/1785834607525-8465c0fd54c8.jpg,/uploads/products/1785834611878-1d4f534b3573.jpg,/uploads/products/1785834613917-6b2b3c3097d6.jpg,/uploads/products/1785834616347-6c066890c97a.jpg,/uploads/products/1785834621676-60c5176c883b.jpg,/uploads/products/1785834623985-814ddc37d92f.jpg,/uploads/products/1785834626162-44204fb7f424.jpg,/uploads/products/1785834634764-c598d79fb1db.png,/uploads/products/1785834638202-7aeb15ed8631.png,/uploads/products/1785834640267-7083e612aeeb.png,/uploads/products/1785834642400-3734259a1059.png,/uploads/products/1785834648802-9099bb388d84.png,/uploads/products/1785834651863-83719f7066a2.png,/uploads/products/1785834654722-fb342b80ed2c.png,/uploads/products/1785834657476-f27b65e5e5eb.png}	\N	\N	{블랙,베이지,카키,브라운}	{FREE}	{/uploads/products/1785833788088-2a9b5193f3ba.jpg,/uploads/products/1785910628949-c5274d70f06f.jpg,/uploads/products/1785910636585-0f8e7e73ba93.jpg}	\N	피그먼트 워싱과 웨스턴 포켓 디테일로 빈티지하면서도 남성적인 무드 완성	\N
26	브러쉬 워싱 세미 부츠컷 데님	62000	87000	\N	\N	BOTTOM	{데님}	/uploads/products/1785914896572-0aa21a7576d0.png	<p>PRODUCT INFORMATION</p><p>* 제품 사이즈는 측정 방법과 위치에 따라 1~3cm 정도의 오차가 발생할 수 있습니다.</p><p>* 모니터 해상도와 촬영 환경에 따라 실제 제품과 미세한 색상 차이가 있을 수 있습니다.</p><p>* 위 사유는 제품 불량에 해당하지 않아 무상 교환·반품이 어렵습니다. 단, 배송비 부담 시 교환·반품이 가능합니다.</p><p>* 밝은 색상과 화이트 계열 및 린넨 소재는 원단 특성상 약간의 비침이 있을 수 있습니다.</p><p>* 제품의 변형과 물 빠짐을 최소화하기 위해 단독 손세탁을 권장하며, 컬러 제품은 흰색 제품과 분리하여 세탁해 주세요.</p><p>* 어두운 색상과 데님 제품은 원단 특성상 착용 또는 세탁 과정에서 물 빠짐과 이염이 발생할 수 있으니 밝은 색상의 의류 및 소품과 함께 착용할 때 주의해 주세요.</p><p>제조사 · DNJ STUDIO 협력업체</p><p>제조국 · 대한민국</p><p>제조연월 · 주문일 기준 6개월 이내 제조</p><p>품질보증기준 · 제품 이상 발생 시 공정거래위원회 고시 소비자분쟁해결기준에 따라 보상</p><p>A/S 및 고객문의 · 카카오톡 채널 : 디앤제이스튜디오 / 인스타 DM : dnj_studio_</p>	f	f	2026-08-05 07:28:53.998769+00	{/uploads/products/1785914902677-00aaf33e6a14.png,/uploads/products/1785914904695-abe126f4d0f3.png,/uploads/products/1785914906577-ff6699a4ed5b.png,/uploads/products/1785914908417-351aba15689a.jpg,/uploads/products/1785914910505-5682684b5ba0.png,/uploads/products/1785914913044-bbcee4a396c7.png,/uploads/products/1785914915091-8deabde2fcec.png,/uploads/products/1785914917315-26cda57dd4c8.png}	\N	\N	{중청}	{S,M,L}	{/uploads/products/1785914896572-0aa21a7576d0.png}	\N	자연스러운 브러쉬 워싱과 과하지 않은 세미 부츠컷 실루엣으로 길고 균형 잡힌 레그 라인 연출	\N
22	D링 퍼티 워크 와이드 팬츠	59800	77000	NEW	\N	BOTTOM	{}	/uploads/products/1785760350278-81b683d97fb0.png	<p>PRODUCT INFORMATION</p><p>* 제품 사이즈는 측정 방법과 위치에 따라 1~3cm 정도의 오차가 발생할 수 있습니다.</p><p>* 모니터 해상도와 촬영 환경에 따라 실제 제품과 미세한 색상 차이가 있을 수 있습니다.</p><p>* 위 사유는 제품 불량에 해당하지 않아 무상 교환·반품이 어렵습니다. 단, 배송비 부담 시 교환·반품이 가능합니다.</p><p>* 밝은 색상과 화이트 계열 및 린넨 소재는 원단 특성상 약간의 비침이 있을 수 있습니다.</p><p>* 제품의 변형과 물 빠짐을 최소화하기 위해 단독 손세탁을 권장하며, 컬러 제품은 흰색 제품과 분리하여 세탁해 주세요.</p><p>* 어두운 색상과 데님 제품은 원단 특성상 착용 또는 세탁 과정에서 물 빠짐과 이염이 발생할 수 있으니 밝은 색상의 의류 및 소품과 함께 착용할 때 주의해 주세요.</p><p>제조사 · DNJ STUDIO 협력업체</p><p>제조국 · 대한민국</p><p>제조연월 · 주문일 기준 6개월 이내 제조</p><p>품질보증기준 · 제품 이상 발생 시 공정거래위원회 고시 소비자분쟁해결기준에 따라 보상</p><p>A/S 및 고객문의 · 카카오톡 채널 : 디앤제이스튜디오 / 인스타 DM : dnj_studio_</p>	f	t	2026-08-03 12:37:29.865249+00	{/uploads/products/1785760619216-f392d8b20ff4.png,/uploads/products/1785760559769-a7b73758ccab.png,/uploads/products/1785760564411-e335bdd11154.jpg,/uploads/products/1785760566708-44baf973fc67.jpg,/uploads/products/1785760574688-1333a4e163ba.png,/uploads/products/1785760576849-f4573338e5b4.png,/uploads/products/1785760583883-97071f8d6c21.png,/uploads/products/1785760585743-d01ad323b562.png,/uploads/products/1785760588247-7e2820e7081e.png,/uploads/products/1785760594747-740414c0fc4a.png,/uploads/products/1785760597528-c3b22115ae06.jpg,/uploads/products/1785760599963-66bf074a560c.jpg,/uploads/products/1785760606615-609bb4baf44d.png,/uploads/products/1785760622611-bea7cdd91886.png,/uploads/products/1785760624860-1e6cf81502c7.png,/uploads/products/1785832525787-4028df474b07.png,/uploads/products/1785760629267-b1b21ef43900.png}	\N	\N	{연그레이,회베이지}	{S,M,L}	{/uploads/products/1785760350278-81b683d97fb0.png,/uploads/products/1785910576787-3aec1472264a.jpg,/uploads/products/1785910592337-cd962b70815b.png}	\N	허리 D링 디테일로 유니크한 포인트를 더하고, 볼륨감 있는 와이드핏으로 트렌디한 실루엣 완성	\N
25	스트라이프 레이어드 헨리넥 반팔 티셔츠	38900	46000	\N	\N	TOP	{반팔}	/uploads/products/1785914334420-087089a35380.png	<p>PRODUCT INFORMATION</p><p>* 제품 사이즈는 측정 방법과 위치에 따라 1~3cm 정도의 오차가 발생할 수 있습니다.</p><p>* 모니터 해상도와 촬영 환경에 따라 실제 제품과 미세한 색상 차이가 있을 수 있습니다.</p><p>* 위 사유는 제품 불량에 해당하지 않아 무상 교환·반품이 어렵습니다. 단, 배송비 부담 시 교환·반품이 가능합니다.</p><p>* 밝은 색상과 화이트 계열 및 린넨 소재는 원단 특성상 약간의 비침이 있을 수 있습니다.</p><p>* 제품의 변형과 물 빠짐을 최소화하기 위해 단독 손세탁을 권장하며, 컬러 제품은 흰색 제품과 분리하여 세탁해 주세요.</p><p>* 어두운 색상과 데님 제품은 원단 특성상 착용 또는 세탁 과정에서 물 빠짐과 이염이 발생할 수 있으니 밝은 색상의 의류 및 소품과 함께 착용할 때 주의해 주세요.</p><p>제조사 · DNJ STUDIO 협력업체</p><p>제조국 · 대한민국</p><p>제조연월 · 주문일 기준 6개월 이내 제조</p><p>품질보증기준 · 제품 이상 발생 시 공정거래위원회 고시 소비자분쟁해결기준에 따라 보상</p><p>A/S 및 고객문의 · 카카오톡 채널 : 디앤제이스튜디오 / 인스타 DM : dnj_studio_</p>	f	f	2026-08-05 07:25:34.551853+00	{/uploads/products/1785914514701-f0b6f85a0a6b.png,/uploads/products/1785914518050-914a51a2eb30.png,/uploads/products/1785914520274-9122143d7c65.png,/uploads/products/1785914692916-154a35963d5c.png,/uploads/products/1785914695279-fa4c1ed05249.png,/uploads/products/1785914698880-2054b66d2bf4.png,/uploads/products/1785914701701-c45eb629f631.png,/uploads/products/1785914703974-e198cdc4c888.png,/uploads/products/1785914705995-b2a46e9a77bb.png}	\N	\N	{블랙/블루,네이비/스카이블루}	{FREE}	{/uploads/products/1785914334420-087089a35380.png,/uploads/products/1785914710815-3fbde8feee90.png}	\N	넥라인과 밑단에 드러나는 배색 스트라이프 레이어드와 헨리넥 버튼 디테일로 감각적인 스타일을 완성	\N
27	커브 패널 코튼 와이드 하프 팬츠	43000	51000	\N	\N	BOTTOM	{반바지}	/uploads/products/1785938275848-e389051b9588.png	<p>PRODUCT INFORMATION</p><p>* 제품 사이즈는 측정 방법과 위치에 따라 1~3cm 정도의 오차가 발생할 수 있습니다.</p><p>* 모니터 해상도와 촬영 환경에 따라 실제 제품과 미세한 색상 차이가 있을 수 있습니다.</p><p>* 위 사유는 제품 불량에 해당하지 않아 무상 교환·반품이 어렵습니다. 단, 배송비 부담 시 교환·반품이 가능합니다.</p><p>* 밝은 색상과 화이트 계열 및 린넨 소재는 원단 특성상 약간의 비침이 있을 수 있습니다.</p><p>* 제품의 변형과 물 빠짐을 최소화하기 위해 단독 손세탁을 권장하며, 컬러 제품은 흰색 제품과 분리하여 세탁해 주세요.</p><p>* 어두운 색상과 데님 제품은 원단 특성상 착용 또는 세탁 과정에서 물 빠짐과 이염이 발생할 수 있으니 밝은 색상의 의류 및 소품과 함께 착용할 때 주의해 주세요.</p><p>제조사 · DNJ STUDIO 협력업체</p><p>제조국 · 대한민국</p><p>제조연월 · 주문일 기준 6개월 이내 제조</p><p>품질보증기준 · 제품 이상 발생 시 공정거래위원회 고시 소비자분쟁해결기준에 따라 보상</p><p>A/S 및 고객문의 · 카카오톡 채널 : 디앤제이스튜디오 / 인스타 DM : dnj_studio_</p>	f	f	2026-08-05 14:01:28.577283+00	{/uploads/products/1785938449263-d642742a160b.png,/uploads/products/1785938451967-deb812f7e4cd.png,/uploads/products/1785938454921-6c6694fc3fcf.png,/uploads/products/1785938457220-b1e53c897cf3.png,/uploads/products/1785938459115-ae30fb1637e9.jpg,/uploads/products/1785938461952-4022e439d895.png,/uploads/products/1785938683483-8dd2746bb6a2.png,/uploads/products/1785938468550-f1f7ba148274.png,/uploads/products/1785938470746-3c417148c836.png}	\N	\N	{베이지,차콜}	{FREE}	{/uploads/products/1785938275848-e389051b9588.png,/uploads/products/1785938279911-33f6b36569c2.png}	\N	허리부터 밑단까지 이어지는 구조적인 절개선으로 심플한 디자인에 입체감을 더한 아이템	\N
28	더블 메탈 웨스턴 레더 벨트	21000	33000	추천	\N	ACC	{}	/uploads/products/1785998606443-7e52898bca21.png	<p>PRODUCT INFORMATION</p><p>* 제품 사이즈는 측정 방법과 위치에 따라 1~3cm 정도의 오차가 발생할 수 있습니다.</p><p>* 모니터 해상도와 촬영 환경에 따라 실제 제품과 미세한 색상 차이가 있을 수 있습니다.</p><p>* 위 사유는 제품 불량에 해당하지 않아 무상 교환·반품이 어렵습니다. 단, 배송비 부담 시 교환·반품이 가능합니다.</p><p>* 밝은 색상과 화이트 계열 및 린넨 소재는 원단 특성상 약간의 비침이 있을 수 있습니다.</p><p>* 제품의 변형과 물 빠짐을 최소화하기 위해 단독 손세탁을 권장하며, 컬러 제품은 흰색 제품과 분리하여 세탁해 주세요.</p><p>* 어두운 색상과 데님 제품은 원단 특성상 착용 또는 세탁 과정에서 물 빠짐과 이염이 발생할 수 있으니 밝은 색상의 의류 및 소품과 함께 착용할 때 주의해 주세요.</p><p>제조사 · DNJ STUDIO 협력업체</p><p>제조국 · 중국</p><p>제조연월 · 주문일 기준 6개월 이내 제조</p><p>품질보증기준 · 제품 이상 발생 시 공정거래위원회 고시 소비자분쟁해결기준에 따라 보상</p><p>A/S 및 고객문의 · 카카오톡 채널 : 디앤제이스튜디오 / 인스타 DM : dnj_studio_</p><p></p>	t	f	2026-08-06 06:47:27.456756+00	{/uploads/products/1785998614789-9483bb20273d.png,/uploads/products/1785998617943-5fcaa27eeab8.png,/uploads/products/1785998628224-ca10bd2fa826.png,/uploads/products/1785998630363-d83761ce4553.png,/uploads/products/1785998632944-21e719df4a22.png,/uploads/products/1785998638908-7f056ed5dbb7.png,/uploads/products/1785998641178-f24e7745a458.png,/uploads/products/1785998643188-2a0db2d03ff9.png,/uploads/products/1785998646294-958698457314.png,/uploads/products/1785998648149-7b3b610e5326.png}	\N	\N	{블랙,베이지,브라운}	{FREE}	{/uploads/products/1785998606443-7e52898bca21.png,/uploads/products/1785998608910-504bae2259f2.png,/uploads/products/1785998610981-df0786bf3748.png}	\N	100% 소가죽의 탄탄한 질감에 더블 메탈 루프와 실버 팁 디테일을 더해 은은한 웨스턴 무드를 연출한 슬림 레더 벨트	\N
\.


--
-- Data for Name: user_coupons; Type: TABLE DATA; Schema: public; Owner: dnjstudio
--

COPY public.user_coupons (id, user_id, amount, reason, is_used, issued_at, used_at, expires_at) FROM stdin;
1	2	3000	signup_welcome	t	2026-07-27 08:22:29.270805+00	2026-07-27 14:36:39.051979+00	2026-10-25 08:22:29.270805+00
6	7	3000	signup_welcome	t	2026-07-27 15:13:11.398691+00	2026-07-27 15:16:03.066151+00	2026-10-25 15:13:11.398691+00
7	2	100000000	관리자 지급	f	2026-08-04 13:29:28.200185+00	\N	\N
8	7	1000	관리자 지급	f	2026-08-04 13:29:41.191742+00	\N	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: dnjstudio
--

COPY public.users (id, email, password_hash, name, phone, birth_date, region, zip_code, address, address_detail, is_admin, is_active, created_at) FROM stdin;
1	ldh09069674	$2a$10$eiAovWjSq2EM/ml7hZRB6OZpNe2MrCyBDd.OTahAOsywd3Fq9EPye	관리자	\N	\N	\N	\N	\N	\N	t	t	2026-07-25 02:18:17.147009+00
2	minui0649@gmail.com	$2a$10$nnpj/MvyvD9Wf.44i6JsROirQcGQ3.MkOqh/ZNtoV0qkdwJcy6FbS	이민우	01085737857	2002-10-18	서울	02567	정릉천동로36	106동402호	f	t	2026-07-27 08:22:29.270805+00
7	ehdghk9674@gmail.com	$2a$10$6z3eBsRfhl2dDwfER9Un6OYDXlS8H0ir2y3MS2n25YGP/fr2NnK0a	이동화	01064707857	\N	서울	01871	서울 노원구 월계동 911-8 	301	f	t	2026-07-27 15:13:11.398691+00
\.


--
-- Data for Name: wishlist_items; Type: TABLE DATA; Schema: public; Owner: dnjstudio
--

COPY public.wishlist_items (id, user_id, product_id, created_at) FROM stdin;
\.


--
-- Name: cart_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dnjstudio
--

SELECT pg_catalog.setval('public.cart_items_id_seq', 40, true);


--
-- Name: community_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dnjstudio
--

SELECT pg_catalog.setval('public.community_comments_id_seq', 1, true);


--
-- Name: community_posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dnjstudio
--

SELECT pg_catalog.setval('public.community_posts_id_seq', 10, true);


--
-- Name: mileage_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dnjstudio
--

SELECT pg_catalog.setval('public.mileage_transactions_id_seq', 3, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dnjstudio
--

SELECT pg_catalog.setval('public.notifications_id_seq', 14, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dnjstudio
--

SELECT pg_catalog.setval('public.order_items_id_seq', 15, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dnjstudio
--

SELECT pg_catalog.setval('public.orders_id_seq', 15, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dnjstudio
--

SELECT pg_catalog.setval('public.products_id_seq', 28, true);


--
-- Name: user_coupons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dnjstudio
--

SELECT pg_catalog.setval('public.user_coupons_id_seq', 9, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dnjstudio
--

SELECT pg_catalog.setval('public.users_id_seq', 8, true);


--
-- Name: wishlist_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dnjstudio
--

SELECT pg_catalog.setval('public.wishlist_items_id_seq', 2, true);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: community_comments community_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.community_comments
    ADD CONSTRAINT community_comments_pkey PRIMARY KEY (id);


--
-- Name: community_posts community_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.community_posts
    ADD CONSTRAINT community_posts_pkey PRIMARY KEY (id);


--
-- Name: mileage_transactions mileage_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.mileage_transactions
    ADD CONSTRAINT mileage_transactions_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: product_relations product_relations_pkey; Type: CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.product_relations
    ADD CONSTRAINT product_relations_pkey PRIMARY KEY (product_id, related_product_id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: user_coupons user_coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.user_coupons
    ADD CONSTRAINT user_coupons_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: wishlist_items wishlist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_pkey PRIMARY KEY (id);


--
-- Name: wishlist_items wishlist_items_user_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_user_id_product_id_key UNIQUE (user_id, product_id);


--
-- Name: idx_cart_items_user_id; Type: INDEX; Schema: public; Owner: dnjstudio
--

CREATE INDEX idx_cart_items_user_id ON public.cart_items USING btree (user_id);


--
-- Name: idx_cart_items_user_product_variant; Type: INDEX; Schema: public; Owner: dnjstudio
--

CREATE UNIQUE INDEX idx_cart_items_user_product_variant ON public.cart_items USING btree (user_id, product_id, color, size);


--
-- Name: idx_community_comments_post_id; Type: INDEX; Schema: public; Owner: dnjstudio
--

CREATE INDEX idx_community_comments_post_id ON public.community_comments USING btree (post_id);


--
-- Name: idx_community_posts_board_type; Type: INDEX; Schema: public; Owner: dnjstudio
--

CREATE INDEX idx_community_posts_board_type ON public.community_posts USING btree (board_type, id DESC);


--
-- Name: idx_community_posts_product_id; Type: INDEX; Schema: public; Owner: dnjstudio
--

CREATE INDEX idx_community_posts_product_id ON public.community_posts USING btree (product_id);


--
-- Name: idx_community_posts_user_id; Type: INDEX; Schema: public; Owner: dnjstudio
--

CREATE INDEX idx_community_posts_user_id ON public.community_posts USING btree (user_id);


--
-- Name: idx_mileage_transactions_user_id; Type: INDEX; Schema: public; Owner: dnjstudio
--

CREATE INDEX idx_mileage_transactions_user_id ON public.mileage_transactions USING btree (user_id);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: dnjstudio
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id, id DESC);


--
-- Name: idx_order_items_order_id; Type: INDEX; Schema: public; Owner: dnjstudio
--

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);


--
-- Name: idx_order_items_product_id; Type: INDEX; Schema: public; Owner: dnjstudio
--

CREATE INDEX idx_order_items_product_id ON public.order_items USING btree (product_id);


--
-- Name: idx_orders_user_id; Type: INDEX; Schema: public; Owner: dnjstudio
--

CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);


--
-- Name: idx_product_relations_related; Type: INDEX; Schema: public; Owner: dnjstudio
--

CREATE INDEX idx_product_relations_related ON public.product_relations USING btree (related_product_id);


--
-- Name: idx_products_best_order_uniq; Type: INDEX; Schema: public; Owner: dnjstudio
--

CREATE UNIQUE INDEX idx_products_best_order_uniq ON public.products USING btree (best_order) WHERE (best_order IS NOT NULL);


--
-- Name: idx_products_category; Type: INDEX; Schema: public; Owner: dnjstudio
--

CREATE INDEX idx_products_category ON public.products USING btree (category);


--
-- Name: idx_products_hero_slot_uniq; Type: INDEX; Schema: public; Owner: dnjstudio
--

CREATE UNIQUE INDEX idx_products_hero_slot_uniq ON public.products USING btree (hero_slot) WHERE (hero_slot IS NOT NULL);


--
-- Name: idx_products_new_order_uniq; Type: INDEX; Schema: public; Owner: dnjstudio
--

CREATE UNIQUE INDEX idx_products_new_order_uniq ON public.products USING btree (new_order) WHERE (new_order IS NOT NULL);


--
-- Name: idx_products_tags; Type: INDEX; Schema: public; Owner: dnjstudio
--

CREATE INDEX idx_products_tags ON public.products USING gin (tags);


--
-- Name: idx_user_coupons_user_id; Type: INDEX; Schema: public; Owner: dnjstudio
--

CREATE INDEX idx_user_coupons_user_id ON public.user_coupons USING btree (user_id);


--
-- Name: idx_wishlist_items_user_id; Type: INDEX; Schema: public; Owner: dnjstudio
--

CREATE INDEX idx_wishlist_items_user_id ON public.wishlist_items USING btree (user_id);


--
-- Name: cart_items cart_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: community_comments community_comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.community_comments
    ADD CONSTRAINT community_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.community_posts(id) ON DELETE CASCADE;


--
-- Name: community_comments community_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.community_comments
    ADD CONSTRAINT community_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: community_posts community_posts_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.community_posts
    ADD CONSTRAINT community_posts_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: community_posts community_posts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.community_posts
    ADD CONSTRAINT community_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: mileage_transactions mileage_transactions_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.mileage_transactions
    ADD CONSTRAINT mileage_transactions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: mileage_transactions mileage_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.mileage_transactions
    ADD CONSTRAINT mileage_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: orders orders_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.user_coupons(id) ON DELETE SET NULL;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: product_relations product_relations_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.product_relations
    ADD CONSTRAINT product_relations_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_relations product_relations_related_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.product_relations
    ADD CONSTRAINT product_relations_related_product_id_fkey FOREIGN KEY (related_product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: user_coupons user_coupons_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.user_coupons
    ADD CONSTRAINT user_coupons_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: wishlist_items wishlist_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: wishlist_items wishlist_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dnjstudio
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict ITaY2WhFGBgBDMVhgUYwJqIxsnjWe875uZbc83lBPRcnxH4ebN7XbKDhO3qopdN

