from django.urls import path
from .views import home, turmas_geral, professores_geral, alunos_geral, chamada, cadastrar_turma, cadastrar_aluno, listar_turmas,cadastrar_professor,obter_totais, atualizar_turma, detalhar_turma, listar_turmas_completas, listar_professores, listar_alunos, detalhar_aluno, atualizar_aluno, listar_professores_geral,  atualizar_professor, detalhar_professor, listar_presenca, salvar_presenca, listar_aniversariantes, excluir_turma, excluir_aluno, excluir_professor 

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
    path("listar_professores_geral/", listar_professores_geral, name="listar_professores_geral"),
    path("detalhar_professor/<int:professor_id>/", detalhar_professor, name="detalhar_professor"),
    path("atualizar_professor/", atualizar_professor, name="atualizar_professor"),
    path("listar_alunos/", listar_alunos, name="listar_alunos"),
    path('detalhar_aluno/<int:aluno_id>/', detalhar_aluno, name='detalhar_aluno'),
    path("atualizar_aluno/", atualizar_aluno, name="atualizar_aluno"),
    path("listar_presenca/", listar_presenca, name="listar_presenca"),
    path('salvar_presenca/', salvar_presenca, name='salvar_presenca'),
    path('listar_aniversariantes/', listar_aniversariantes, name='listar_aniversariantes'),
    path('excluir_turma/<int:turma_id>/', excluir_turma, name='excluir_turma'),
    path('excluir_aluno/<int:aluno_id>/', excluir_aluno, name='excluir_aluno'),
    path('excluir_professor/<int:professor_id>/', excluir_professor, name='excluir_professor'),

]
