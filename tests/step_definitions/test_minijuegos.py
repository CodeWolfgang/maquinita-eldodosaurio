import os
import time
from pytest_bdd import scenarios, given, when, then
from playwright.sync_api import Page, expect

# Apunta al archivo .feature
scenarios('../features/minijuegos.feature')

@given("abro la maquinita web")
def open_game(page: Page):
    # Obtenemos la ruta absoluta de tu index.html local
    current_dir = os.path.dirname(os.path.abspath(__file__))
    html_path = f"file:///{os.path.join(current_dir, '../../index.html')}"
    page.goto(html_path)

@given("tengo 100 creditos iniciales")
def verify_credits(page: Page):
    expect(page.locator('#credit-counter')).to_have_text("100")

@when('apuesto 1 moneda a "cereza"')
def bet_cherry(page: Page):
    page.locator('.bet-cereza').click()
    expect(page.locator('#credit-counter')).to_have_text("99")

@when('fuerzo la ruleta para que caiga en "oncemore"')
def force_oncemore(page: Page):
    # Hackeamos la función Math.random del navegador.
    # En tu script: Math.floor(Math.random() * 24) + 1. 
    # Si random es 0.88 -> 0.88 * 24 = 21.12 -> floor(21.12) = 21 -> +1 = 22 (Casilla ONCE MORE)
    page.evaluate("Math.random = () => 0.88;")

@when('presiono el boton "START"')
def press_start(page: Page):
    page.locator('#btn-start').click()

@then('el estado del minijuego se activa mostrando "PRESIONA START"')
def verify_minigame(page: Page):
    # Esperamos a que la ruleta termine de girar y se muestre el popup central
    expect(page.locator('.sec-prensa-start')).to_be_visible(timeout=8000)
    expect(page.locator('.sec-legend')).to_have_text("PRESIONA START")

@when('presiono el boton "START" para detener el minijuego')
def stop_minigame(page: Page):
    page.locator('#btn-start').click()

@then('el panel central cambia la leyenda a "¡TIROS!"')
def verify_tiros_legend(page: Page):
    expect(page.locator('.sec-legend')).to_have_text("¡TIROS!")

@then('la ruleta gira de nuevo automaticamente sin descontar mi credito')
def verify_auto_spin(page: Page):
    # Verificamos que el popup desaparezca
    expect(page.locator('.sec-prensa-start')).to_be_hidden(timeout=3000)
    
    # Verificamos que el crédito sigue siendo 99 (el tiro fue gratis)
    expect(page.locator('#credit-counter')).to_have_text("99")
    
    # Pequeña pausa visual al correr el test para que veas el éxito
    time.sleep(2)