from django.contrib import admin

from .models import Turma, Professor, Aluno, Presenca

admin.site.register(Turma)
admin.site.register(Professor)
admin.site.register(Aluno)
admin.site.register(Presenca)

