import os
import sys
import subprocess
import sys
import os
import controle_presenca 
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import os
os.system("python manage.py runserver 127.0.0.1:8080")


# Verifique se o módulo está acessível
try:
    import controle_presenca
except ImportError:
    print("Erro: Módulo 'controle_presenca' não encontrado!")
# Obtém o diretório do PyInstaller (quando em modo empacotado)
BASE_DIR = getattr(sys, '_MEIPASS', os.path.abspath(os.path.dirname(__file__)))

# Adiciona o diretório base ao sys.path
sys.path.append(BASE_DIR)

# Define a variável de ambiente para as configurações do Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "controle_presenca.settings")

# Caminho correto do manage.py
manage_py = os.path.join(BASE_DIR, "manage.py")

# Caminho para o manage.py correto
manage_path = os.path.join(BASE_DIR, "manage.py")

# Verifica se manage.py existe antes de executar
if not os.path.exists(manage_path):
    print(f"Erro: O arquivo manage.py não foi encontrado no caminho esperado: {manage_path}")
    sys.exit(1)

print(f"Iniciando Django... ({manage_py})")

# Inicia o servidor Django
subprocess.run(["python", manage_py, "runserver", "127.0.0.1:8080"])
