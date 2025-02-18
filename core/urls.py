from django.urls import path
from .views import home, turmas_geral, professores_geral, alunos_geral, chamada, cadastrar_turma, cadastrar_aluno, listar_turmas,cadastrar_professor,obter_totais, atualizar_turma, detalhar_turma, listar_turmas_completas, listar_professores

urlpatterns = [
    path('', home, name='home'),
    path('turmas/', turmas_geral, name='turmas_geral'),
    path('professores/', professores_geral, name='professores_geral'),
    path('alunos/', alunos_geral, name='alunos_geral'),
    path('chamada/', chamada, name='chamada'),
    path('cadastrar_turma/', cadastrar_turma, name='cadastrar_turma'),
    path('cadastrar_aluno/', cadastrar_aluno, name='cadastrar_aluno'),
    path('listar_turmas/', listar_turmas, name='listar_turmas'), 
    path("cadastrar_professor/", cadastrar_professor, name="cadastrar_professor"),
    path("obter_totais/", obter_totais, name="obter_totais"),
    path("atualizar_turma/", atualizar_turma, name="atualizar_turma"),
    path("detalhar_turma/<int:turma_id>/", detalhar_turma, name="detalhar_turma"),
    path("listar_turmas_completas/", listar_turmas_completas, name="listar_turmas_completas"),
    path("listar_professores/", listar_professores, name="listar_professores"),


]
