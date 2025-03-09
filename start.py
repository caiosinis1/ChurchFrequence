import sys
import os
import subprocess
import time
import webbrowser
import locale

# Define o encoding correto
if sys.stdout:
    sys.stdout.reconfigure(encoding='utf-8')

if sys.stderr:
    sys.stderr.reconfigure(encoding='utf-8')

# Obtém o diretório base do PyInstaller
BASE_DIR = getattr(sys, '_MEIPASS', os.path.abspath(os.path.dirname(__file__)))

# Define a variável de ambiente para o Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "controle_presenca.settings")

# Caminho correto do manage.py
manage_py = os.path.join(BASE_DIR, "manage.py")

# Verifica se o arquivo manage.py existe
if not os.path.exists(manage_py):
    print(f"❌ Erro: O arquivo manage.py não foi encontrado em {manage_py}")
    sys.exit(1)

print(f"📌 Iniciando Django... ({manage_py})")

# Inicia o servidor Django e captura a saída corretamente
server_process = subprocess.Popen(
    ["python", manage_py, "runserver", "127.0.0.1:8080"],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True,
    encoding='utf-8'  # Forçando UTF-8
)

# Aguarda um tempo para iniciar
time.sleep(3)

# Abre o navegador
webbrowser.open("http://127.0.0.1:8080/")

# Exibir saída do Django no terminal para depuração
while True:
    output = server_process.stdout.readline()
    if output:
        print(output.strip())

    error = server_process.stderr.readline()
    if error:
        print("❌ ERRO:", error.strip())

    if server_process.poll() is not None:
        break
