import uuid
from django.db import models

class Turma(models.Model):
    nome = models.CharField(max_length=100, unique=True)
    faixa_etaria_de = models.IntegerField()
    faixa_etaria_ate = models.IntegerField()
    codigo = models.CharField(max_length=8, unique=True, blank=True)  # Código identificador único

    def save(self, *args, **kwargs):
        if not self.codigo:
            self.codigo = str(uuid.uuid4().hex[:8])  # Gerar código único de 8 caracteres
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nome} ({self.codigo})"



# Modelo de Professor
class Professor(models.Model):
    nome = models.CharField(max_length=255)
    data_nascimento = models.DateField()
    turmas = models.ManyToManyField("Turma", blank=True)
    matricula = models.CharField(max_length=10, unique=True, editable=False)  # Matrícula única

    def save(self, *args, **kwargs):
        if not self.matricula:
            self.matricula = str(uuid.uuid4().hex[:8]).upper()  # Gera um código único de 8 caracteres
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nome} ({self.matricula})"
# Modelo de Aluno
from django.db import models
import uuid

class Aluno(models.Model):
    nome = models.CharField(max_length=100)
    data_nascimento = models.DateField()
    turma = models.ForeignKey(Turma, on_delete=models.CASCADE, related_name="alunos")
    matricula = models.CharField(max_length=10, unique=True, blank=True)  # Matrícula única

    def save(self, *args, **kwargs):
        if not self.matricula:
            self.matricula = str(uuid.uuid4().hex[:10]).upper()  # Gera matrícula única
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nome} ({self.matricula}) - {self.turma.nome}"


# Modelo de Presença
class Presenca(models.Model):
    aluno = models.ForeignKey(Aluno, on_delete=models.CASCADE, related_name="presencas")
    data = models.DateField(auto_now_add=True)
    presente = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.aluno.nome} - {self.data} - {'Presente' if self.presente else 'Faltou'}"

