from django.shortcuts import render
from django.shortcuts import render, redirect
from .models import Turma
from .forms import TurmaForm
from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import Turma, Aluno, Professor
import uuid
from django.views.decorators.csrf import csrf_exempt
import json
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Turma
import json
import random

from django.shortcuts import render, redirect
from django.http import JsonResponse
from core.models import Turma
import uuid


def index(request):
    return render(request, 'index.html')

def home(request):
    return render(request, 'home.html')

def turmas_geral(request):
    return render(request, 'turmasGeral.html')

def professores_geral(request):
    turmas = Turma.objects.all()
    return render(request, 'professoresGeral.html', {'turmas': turmas})

def alunos_geral(request):
    turmas = Turma.objects.all()
    return render(request, 'alunosGeral.html', {'turmas': turmas})

def chamada(request):
    return render(request, 'chamada.html')

def listar_turmas(request):
    turmas = Turma.objects.all().values("id", "nome")
    return JsonResponse({"turmas": list(turmas)})

def detalhar_turma(request, turma_id):
    turma = get_object_or_404(Turma, id=turma_id)

    # Obtendo os professores da turma através da relação ManyToMany do modelo Professor
    professores = Professor.objects.filter(turmas=turma).values("id", "nome")

    turma_detalhes = {
        "id": turma.id,
        "nome": turma.nome,
        "faixa_etaria_de": turma.faixa_etaria_de,
        "faixa_etaria_ate": turma.faixa_etaria_ate,
        "professores": list(professores)  # Retorna uma lista de dicionários com id e nome dos professores
    }

    return JsonResponse({"status": "sucesso", "turma": turma_detalhes})

def listar_professores(request):
    professores = Professor.objects.all().values("id", "nome")
    return JsonResponse({"professores": list(professores)})


#FUNCOES DE TURMA
def cadastrar_turma(request):
    if request.method == "POST":
        nome = request.POST.get("nome-turma")
        faixa_etaria_de = request.POST.get("faixa-etaria-de")
        faixa_etaria_ate = request.POST.get("faixa-etaria-ate")

        if nome and faixa_etaria_de and faixa_etaria_ate:
            nova_turma = Turma(
                nome=nome,
                faixa_etaria_de=int(faixa_etaria_de),
                faixa_etaria_ate=int(faixa_etaria_ate)
            )

            # Geração do código único
            nova_turma.codigo = str(uuid.uuid4().hex[:8])
            print("Dados recebidos:", request.POST)
            nova_turma.save()

            return JsonResponse({"status": "sucesso", "codigo": nova_turma.codigo})
        else:
            return JsonResponse({"status": "erro", "mensagem": "Preencha todos os campos."})

    return JsonResponse({"status": "erro", "mensagem": "Método inválido."})

#FUNCOES DE ALUNOS
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Aluno, Turma
import uuid

@csrf_exempt
def cadastrar_aluno(request):
    if request.method == "POST":
        nome = request.POST.get("nome-aluno")
        data_nascimento = request.POST.get("data-nascimento-aluno")
        turma_id = request.POST.get("turma")

        # Verifica se existem turmas cadastradas
        if not Turma.objects.exists():
            return JsonResponse({
                "status": "erro",
                "mensagem": "Nenhuma turma cadastrada. Cadastre uma turma antes de cadastrar um aluno."
            })

        # Verifica se o usuário selecionou uma turma
        if not turma_id:
            return JsonResponse({
                "status": "erro",
                "mensagem": "Nenhuma turma selecionada. Escolha uma turma antes de cadastrar o aluno."
            })

        # Tenta buscar a turma no banco de dados
        try:
            turma = Turma.objects.get(id=turma_id)
        except Turma.DoesNotExist:
            return JsonResponse({
                "status": "erro",
                "mensagem": "Turma selecionada não encontrada. Verifique e tente novamente."
            })

        # Verifica se os campos obrigatórios foram preenchidos
        if not nome or not data_nascimento:
            return JsonResponse({
                "status": "erro",
                "mensagem": "Nome e data de nascimento são obrigatórios."
            })

        # Criação do aluno com matrícula única
        aluno = Aluno(
            nome=nome,
            data_nascimento=data_nascimento,
            turma=turma,
            matricula=str(uuid.uuid4().hex[:8]).upper()
        )

        aluno.save()

        return JsonResponse({
            "status": "sucesso",
            "matricula": aluno.matricula
        })

    return JsonResponse({
        "status": "erro",
        "mensagem": "Método inválido."
    })



#FUNCOES DE PROFESSORES
@csrf_exempt
def cadastrar_professor(request):
    if request.method == "POST":
        nome = request.POST.get("nome-professor")
        data_nascimento = request.POST.get("data-nascimento-professor")
        turmas_ids = request.POST.getlist("turma-professor") 

        # Verifica se os campos foram preenchidos
        if not nome or not data_nascimento:
            return JsonResponse({
                "status": "erro",
                "mensagem": "Nome e data de nascimento são obrigatórios."
            })

        # Criação do professor com matrícula única
        professor = Professor(
            nome=nome,
            data_nascimento=data_nascimento,
        )

        professor.save()  # Salva para gerar a matrícula
        professor.turmas.set(Turma.objects.filter(id__in=turmas_ids))  # Associa as turmas
        professor.save()

        return JsonResponse({
            "status": "sucesso",
            "matricula": professor.matricula
        })

    return JsonResponse({
        "status": "erro",
        "mensagem": "Método inválido."
    })
       

#CODIGO PARA OBTER O TOTAL DE TURMA, PROFESSOR E ALUNOS
def obter_totais(request):
    total_turmas = Turma.objects.count()
    total_alunos = Aluno.objects.count()
    total_professores = Professor.objects.count()

    return JsonResponse({
        "total_turmas": total_turmas,
        "total_alunos": total_alunos,
        "total_professores": total_professores
    })


#CODIGO PARA LISTAGEM DE TURMAS
@csrf_exempt
def atualizar_turma(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            turma_id = data.get("id")
            nome = data.get("nome")
            faixa_etaria_de = data.get("faixa_etaria_de")
            faixa_etaria_ate = data.get("faixa_etaria_ate")
            professores_ids = data.get("professores", [])

            turma = Turma.objects.get(id=turma_id)
            turma.nome = nome
            turma.faixa_etaria_de = faixa_etaria_de
            turma.faixa_etaria_ate = faixa_etaria_ate
            turma.save()

            # Atualiza os professores da turma
            turma.professores.clear()  # Remove os professores atuais
            turma.professores.add(*professores_ids)  # Adiciona os novos professores selecionados

            return JsonResponse({"status": "sucesso", "mensagem": "Turma atualizada com sucesso!"})
        except Exception as e:
            return JsonResponse({"status": "erro", "mensagem": f"Erro ao atualizar turma: {str(e)}"})
    
    return JsonResponse({"status": "erro", "mensagem": "Método inválido."})

def listar_turmas_completas(request):
    turmas = Turma.objects.all()
    turmas_lista = []

    for turma in turmas:
        professores = Professor.objects.filter(turmas=turma).values_list("nome", flat=True)

        turma_detalhes = {
            "id": turma.id,
            "nome": turma.nome,
            "faixa_etaria_de": turma.faixa_etaria_de,
            "faixa_etaria_ate": turma.faixa_etaria_ate,
            "professores": list(professores)
        }

        turmas_lista.append(turma_detalhes)

    return JsonResponse({"turmas": turmas_lista})

def listar_turmas_pagina(request):
    turmas = Turma.objects.all()
    return render(request, 'turmasGeral.html', {'turmas': turmas})
