# Ejercicio Atrapa el objetivo con Tkinter

import tkinter as tk
import random

# Configuración inicial
ventana = tk.Tk()
ventana.title("Atrapa el Objetivo")
ventana.geometry("400x400")

puntaje = 0
objetivo = None

# Acciones
def crear_objetivo():
    global objetivo
    objetivo = tk.Button(
        ventana,
        text="¡Clic aquí!",
        bg="green",
        fg="white",
        command=sumar_punto,
        font="Arial 12 bold"
    )
    objetivo.place(
        x=random.randint(50, 300),
        y=random.randint(50, 300)
    )


def sumar_punto():
    global puntaje
    puntaje += 1
    etiqueta_puntaje.config(text=f"Puntaje: {puntaje}")
    objetivo.destroy()  # Elimina el botón actual
    crear_objetivo()   # Crea uno nuevo en otra posición


# Interfaz
etiqueta_puntaje = tk.Label(ventana, text=f"Puntaje: {puntaje}", font=("Arial", 14))
etiqueta_puntaje.pack(pady=20)




crear_objetivo()  # Inicia el juego creando el primer objetivo
ventana.mainloop()