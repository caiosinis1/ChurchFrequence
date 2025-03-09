import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

STATIC_URL = "/static/"

# Define um diretório para coletar os arquivos estáticos
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

# Diretórios adicionais de arquivos estáticos
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "core", "static"),  # Certifique-se de que essa pasta existe
]

# Configuração para servir arquivos estáticos corretamente
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# Definição do ROOT_URLCONF
ROOT_URLCONF = 'controle_presenca.urls'

# ADICIONE ESTA CONFIGURAÇÃO PARA RESOLVER O PROBLEMA:
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'core',  # O nome do seu app Django
]

# Configuração do middleware
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Configuração básica do Django
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'core', 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'controle_presenca.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_L10N = True
USE_TZ = True

ALLOWED_HOSTS = ["127.0.0.1", "localhost", "0.0.0.0"]
