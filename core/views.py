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
from .models import Aluno, Presenca
from datetime import datetime, date



def index(request):
    return render(request, 'index.html')

def home(request):
    return render(request, 'home.html')

def turmas_geral(request):
    turmas = Turma.objects.prefetch_related("professor_set").all()  # Puxa os professores vinculados
    return render(request, 'turmasGeral.html', {'turmas': turmas})


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

    # Obtém os IDs dos professores vinculados a essa turma
    professores_ids = list(turma.professor_set.all().values_list("id", flat=True))

    turma_detalhes = {
        "id": turma.id,
        "nome": turma.nome,
        "faixa_etaria_de": turma.faixa_etaria_de,
        "faixa_etaria_ate": turma.faixa_etaria_ate,
        "professores": professores_ids  # Lista de IDs dos professores vinculados
    }

    return JsonResponse({"status": "sucesso", "turma": turma_detalhes})

def listar_professores(request):
    professores = Professor.objects.all().values("id", "nome")
    return JsonResponse({"professores": list(professores)})

from datetime import datetime

def listar_professores_geral(request):
    professores = Professor.objects.all()
    professores_data = []

    for professor in professores:
        aniversario = "N/A"
        if professor.data_nascimento:
            aniversario = professor.data_nascimento.strftime("%d/%m")  # Formata para "DD/MM"

        professores_data.append({
            "id": professor.id,
            "nome": professor.nome,
            "data_nascimento": professor.data_nascimento.strftime("%Y-%m-%d") if professor.data_nascimento else "",
            "aniversario": aniversario,
            "turmas": [turma.nome for turma in professor.turmas.all()],  # Lista das turmas do professor
        })

    return JsonResponse({"professores": professores_data})



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


def listar_alunos(request):
    alunos = Aluno.objects.all()
    alunos_data = []

    for aluno in alunos:
        # Formata a data de nascimento para exibir apenas dia e mês
        aniversario = aluno.data_nascimento.strftime("%d/%m") if aluno.data_nascimento else "N/A"

        alunos_data.append({
            "id": aluno.id,
            "nome": aluno.nome,
            "turma": aluno.turma.nome if aluno.turma else "Sem turma",
            "aniversario": aniversario,
            "matricula": aluno.matricula,
        })

    return JsonResponse({"alunos": alunos_data})


def detalhar_aluno(request, aluno_id):
    try:
        aluno = Aluno.objects.get(id=aluno_id)
        aluno_data = {
            "id": aluno.id,
            "nome": aluno.nome,
            "data_nascimento": aluno.data_nascimento.strftime("%Y-%m-%d"),
            "turma_id": aluno.turma.id,
        }
        return JsonResponse({"status": "sucesso", "aluno": aluno_data})
    except Aluno.DoesNotExist:
        return JsonResponse({"status": "erro", "mensagem": "Aluno não encontrado"}, status=404)
    

@csrf_exempt
def atualizar_aluno(request):
        if request.method == "POST":
            try:
                data = json.loads(request.body)

                aluno_id = data.get("id")
                nome = data.get("nome")
                data_nascimento = data.get("data_nascimento")
                turma_id = data.get("turma_id")

                aluno = Aluno.objects.get(id=aluno_id)
                aluno.nome = nome
                aluno.data_nascimento = data_nascimento
                aluno.turma = Turma.objects.get(id=turma_id)
                aluno.save()

                return JsonResponse({"status": "sucesso", "mensagem": "Aluno atualizado com sucesso!"})
            except Exception as e:
                return JsonResponse({"status": "erro", "mensagem": f"Erro ao atualizar aluno: {str(e)}"})
        
            return JsonResponse({"status": "erro", "mensagem": "Método inválido."}) 


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
       
def detalhar_professor(request, professor_id):
    try:
        professor = Professor.objects.get(id=professor_id)

        professor_data = {
            "id": professor.id,
            "nome": professor.nome,
            "data_nascimento": professor.data_nascimento.strftime("%Y-%m-%d") if professor.data_nascimento else "",
            "turmas": [turma.id for turma in professor.turmas.all()],  # IDs das turmas associadas
        }

        return JsonResponse({"status": "sucesso", "professor": professor_data})

    except Professor.DoesNotExist:
        return JsonResponse({"status": "erro", "mensagem": "Professor não encontrado."})


@csrf_exempt
def atualizar_professor(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            professor_id = data.get("id")
            nome = data.get("nome")
            data_nascimento = data.get("data_nascimento")
            turmas_ids = data.get("turmas", [])

            professor = Professor.objects.get(id=professor_id)
            professor.nome = nome
            professor.data_nascimento = datetime.strptime(data_nascimento, "%Y-%m-%d") if data_nascimento else None
            professor.save()

            # Atualiza as turmas do professor
            professor.turmas.clear()
            professor.turmas.add(*turmas_ids)

            return JsonResponse({"status": "sucesso", "mensagem": "Professor atualizado com sucesso!"})
        except Exception as e:
            return JsonResponse({"status": "erro", "mensagem": f"Erro ao atualizar professor: {str(e)}"})

    return JsonResponse({"status": "erro", "mensagem": "Método inválido."})


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
            faixa_etaria_de = data.get("faixa_etaria_de")  # Correção do nome da chave
            faixa_etaria_ate = data.get("faixa_etaria_ate")  # Correção do nome da chave
            professores_ids = data.get("professores", [])

            # Obtém a turma do banco de dados
            turma = get_object_or_404(Turma, id=turma_id)
            turma.nome = nome
            turma.faixa_etaria_de = faixa_etaria_de
            turma.faixa_etaria_ate = faixa_etaria_ate
            turma.save()

            # Atualizar professores da turma
            professores = Professor.objects.filter(id__in=professores_ids)
            for professor in professores:
                professor.turmas.add(turma)  # Adiciona a turma a cada professor selecionado

            return JsonResponse({"status": "sucesso", "mensagem": "Turma atualizada com sucesso!"})

        except Exception as e:
            return JsonResponse({"status": "erro", "mensagem": f"Erro ao atualizar turma: {str(e)}"})

    return JsonResponse({"status": "erro", "mensagem": "Método inválido."})

def listar_turmas_completas(request):
    turmas = Turma.objects.prefetch_related("professor_set").all()  # Garante que os professores são carregados
    turmas_json = []

    for turma in turmas:
        professores = turma.professor_set.all().values_list("nome", flat=True)  # Lista de nomes dos professores
        turmas_json.append({
            "id": turma.id,
            "nome": turma.nome,
            "faixa_etaria_de": turma.faixa_etaria_de,
            "faixa_etaria_ate": turma.faixa_etaria_ate,
            "professores": list(professores) if professores else ["Nenhum professor"]  # Lista de professores
        })

    return JsonResponse({"turmas": turmas_json})


def listar_turmas_pagina(request):
    turmas = Turma.objects.all()
    return render(request, 'turmasGeral.html', {'turmas': turmas})



#CODIGOS REFERENTES A CHAMADA
# 🔹 Função para salvar a chamada
@csrf_exempt
def salvar_chamada(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            turma_id = data.get("turma_id")
            domingo = data.get("domingo")
            registros = data.get("registros", [])

            turma = get_object_or_404(Turma, id=turma_id)
            data_chamada = datetime.today().date()

            for registro in registros:
                aluno_id = registro.get("aluno_id")
                presente = registro.get("presente")

                aluno = get_object_or_404(Aluno, id=aluno_id)

                # Verifica se já existe um registro para esse aluno, turma e domingo
                chamada_existente = Presenca.objects.filter(
                    aluno=aluno,
                    turma=turma,
                    domingo=domingo,
                    data=data_chamada
                ).first()

                if chamada_existente:
                    # Atualiza a presença caso já tenha sido registrado
                    chamada_existente.presente = presente
                    chamada_existente.save()
                else:
                    # Cria um novo registro
                    Presenca.objects.create(
                        aluno=aluno,
                        turma=turma,
                        domingo=domingo,
                        presente=presente,
                        data=data_chamada
                    )

            return JsonResponse({"status": "sucesso", "mensagem": "Chamada salva com sucesso!"})

        except Exception as e:
            return JsonResponse({"status": "erro", "mensagem": f"Erro ao salvar chamada: {str(e)}"})

    return JsonResponse({"status": "erro", "mensagem": "Método inválido."})


# 🔹 Função para carregar uma chamada existente para edição
def carregar_chamada(request):
    turma_id = request.GET.get("turma_id")
    domingo = request.GET.get("domingo")

    if not turma_id or not domingo:
        return JsonResponse({"status": "erro", "mensagem": "Turma e domingo são obrigatórios."})

    turma = get_object_or_404(Turma, id=turma_id)
    chamadas = Presenca.objects.filter(turma=turma, domingo=domingo)

    alunos_presenca = []
    for chamada in chamadas:
        alunos_presenca.append({
            "aluno_id": chamada.aluno.id,
            "nome": chamada.aluno.nome,
            "presente": chamada.presente
        })

    return JsonResponse({"status": "sucesso", "alunos": alunos_presenca})


# 🔹 Função para listar os alunos de uma turma para chamada
def listar_alunos_para_chamada(request):
    turma_id = request.GET.get("turma_id")

    if not turma_id:
        return JsonResponse({"status": "erro", "mensagem": "Turma não selecionada."})

    turma = get_object_or_404(Turma, id=turma_id)
    alunos = turma.alunos.all().values("id", "nome")

    return JsonResponse({"status": "sucesso", "alunos": list(alunos)})

def listar_presenca(request):
    turma_id = request.GET.get("turma")
    mes = request.GET.get("mes")
    ano = request.GET.get("ano")
    domingo = request.GET.get("domingo")

    if not turma_id or not mes or not ano or not domingo:
        return JsonResponse({"status": "erro", "mensagem": "Parâmetros incompletos"}, status=400)

    try:
        # Converte os parâmetros para inteiros e gera a data correta
        data_chamada = date(int(ano), int(mes), int(domingo))
    except ValueError:
        return JsonResponse({"status": "erro", "mensagem": "Data inválida. Verifique o domingo informado."}, status=400)

    alunos = Aluno.objects.filter(turma_id=turma_id)
    alunos_data = []
    presentes = 0
    faltantes = 0

    for aluno in alunos:
        presenca = Presenca.objects.filter(aluno=aluno, data=data_chamada).first()
        presente = presenca.presente if presenca else False

        if presente:
            presentes += 1
        else:
            faltantes += 1

        alunos_data.append({
            "id": aluno.id,
            "nome": aluno.nome,
            "presente": presente
        })

    return JsonResponse({
        "status": "sucesso",
        "alunos": alunos_data,
        "presentes": presentes,
        "faltantes": faltantes
    })


@csrf_exempt
def salvar_presenca(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            print("\n🔍 Dados recebidos pelo Django:", data)  # Log para debug

            turma_id = data.get("turma_id")
            mes = data.get("mes")
            ano = data.get("ano")
            domingo = data.get("domingo")
            presencas = data.get("presencas")  # Lista de {aluno_id, presente}

            # Verifica se todos os dados foram recebidos corretamente
            if not all([turma_id, mes, ano, domingo, presencas]):
                return JsonResponse({"status": "erro", "mensagem": "Dados incompletos!"}, status=400)

            # Converte a data do domingo selecionado
            data_chamada = datetime(int(ano), int(mes), 1)  # Primeiro dia do mês
            while data_chamada.weekday() != 6:  # Encontra o primeiro domingo do mês
                data_chamada = data_chamada.replace(day=data_chamada.day + 1)
            for _ in range(int(domingo) - 1):  # Avança para o domingo correto
                data_chamada = data_chamada.replace(day=data_chamada.day + 7)

            turma = Turma.objects.get(id=turma_id)

            # Processa cada presença
            for item in presencas:
                aluno_id = item["aluno_id"]
                presente = item["presente"]

                aluno = Aluno.objects.get(id=aluno_id)

                # Atualiza ou cria a presença no banco de dados
                presenca, created = Presenca.objects.update_or_create(
                    aluno=aluno,
                    turma=turma,
                    data=data_chamada,
                    domingo=domingo,
                    defaults={"presente": presente},
                )

            return JsonResponse({"status": "sucesso", "mensagem": "Presença registrada com sucesso!"})

        except Exception as e:
            return JsonResponse({"status": "erro", "mensagem": f"Erro ao salvar presença: {str(e)}"}, status=500)

    return JsonResponse({"status": "erro", "mensagem": "Método inválido."}, status=400)