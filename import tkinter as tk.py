import tkinter as tk
import random

# Configuración inicial
ventana = tk.Tk()
ventana.title("Atrapa el Objetivo")
ventana.geometry("400x400")

puntaje = 0
objetivo = None
tiempo_restante = 30
juego_activo = True

# Acciones
def crear_objetivo():
    global objetivo
    if not juego_activo:
        return

    if objetivo:
        objetivo.destroy()

    objetivo = tk.Button(
        ventana,
        text="¡Clic aquí!",
        bg="green",
        fg="white",
        command=sumar_punto,
        font="Arial 12 bold"
    )
    mover_objetivo()


def mover_objetivo():
    if not juego_activo:
        return

    objetivo.place(
        x=random.randint(50, 300),
        y=random.randint(50, 300)
    )

    # Se mueve automáticamente cada 2 segundos
    ventana.after(2000, mover_objetivo)


def sumar_punto():
    global puntaje
    if not juego_activo:
        return

    puntaje += 1
    etiqueta_puntaje.config(text=f"Puntaje: {puntaje}")


def actualizar_tiempo():
    global tiempo_restante, juego_activo

    if tiempo_restante > 0:
        tiempo_restante -= 1
        etiqueta_tiempo.config(text=f"Tiempo: {tiempo_restante}")
        ventana.after(1000, actualizar_tiempo)
    else:
        juego_activo = False
        if objetivo:
            objetivo.destroy()
        etiqueta_tiempo.config(text="Tiempo: 0")
        mostrar_game_over()


def mostrar_game_over():
    mensaje = tk.Label(
        ventana,
        text="GAME OVER",
        font=("Arial", 20, "bold"),
        fg="red"
    )
    mensaje.pack(pady=20)


# Interfaz
etiqueta_puntaje = tk.Label(ventana, text=f"Puntaje: {puntaje}", font=("Arial", 14))
etiqueta_puntaje.pack()

etiqueta_tiempo = tk.Label(ventana, text=f"Tiempo: {tiempo_restante}", font=("Arial", 14))
etiqueta_tiempo.pack()

# Iniciar juego
crear_objetivo()
actualizar_tiempo()

ventana.mainloop() 