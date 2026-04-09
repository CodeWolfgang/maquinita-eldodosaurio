import os
import time
from pytest_bdd import scenarios, given, when, then, parsers
from playwright.sync_api import Page, expect

# Apuntamos al archivo feature
scenarios('../features/minijuegos.feature')

@given("abro la maquinita web")
def open_game(page: Page):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    html_path = f"file:///{os.path.join(current_dir, '../../index.html')}"
    page.goto(html_path)

@given("tengo 100 creditos iniciales")
def verify_credits(page: Page):
    expect(page.locator('#credit-counter')).to_have_text("100")

# Usamos parsers.parse para leer las variables de la tabla de Gherkin
@when(parsers.parse('apuesto 1 moneda a "{fruta}"'))
def bet_fruit(page: Page, fruta):
    page.locator(f'.bet-{fruta}').click()
    expect(page.locator('#credit-counter')).to_have_text("99")

@when(parsers.parse('fuerzo la ruleta para que caiga en "{casilla}"'))
def force_roulette(page: Page, casilla):
    # Diccionario con el ID exacto de la casilla que queremos
    casillas_map = {'oncemore': 22, 'bar50': 3, 'bar100': 4}
    target = casillas_map[casilla]
    
    # Formula matemática inversa para que Math.random() nos dé la casilla exacta
    val_to_inject = ((target - 1) + 0.5) / 24.0
    page.evaluate(f"Math.random = () => {val_to_inject};")

@when('presiono el boton "START"')
def press_start(page: Page):
    page.locator('#btn-start').click()

@then(parsers.parse('el saldo de ganancias debe ser "{ganancia}"'))
def verify_win(page: Page, ganancia):
    expect(page.locator('#win-counter')).to_have_text(ganancia)

@then('el estado del minijuego se activa mostrando "PRESIONA START"')
def verify_minigame(page: Page):
    expect(page.locator('.sec-prensa-start')).to_be_visible(timeout=8000)
    expect(page.locator('.sec-legend')).to_have_text("PRESIONA START")

@when(parsers.parse('detengo el minijuego forzando el valor de "{tiros}" tiros'))
def stop_minigame_forced(page: Page, tiros):
    # TRUCO QA: Congelamos visualmente el DOM para que lea el número que dicta la prueba
    page.evaluate(f"document.querySelector('.sec-number').innerText = '{tiros}';")
    page.locator('#btn-start').click()

@then('el panel central cambia la leyenda a "¡TIROS!"')
def verify_tiros_legend(page: Page):
    expect(page.locator('.sec-legend')).to_have_text("¡TIROS!")

@then('el saldo de creditos no disminuye por los giros gratis')
def verify_free_spins_credits(page: Page):
    # Esperamos que la ventana central desaparezca
    expect(page.locator('.sec-prensa-start')).to_be_hidden(timeout=3000)
    # Como es gratis, los créditos deben seguir en 99
    expect(page.locator('#credit-counter')).to_have_text("99")
    time.sleep(1.5) # Pausa para ver la automatización visualmente

@then(parsers.parse('el saldo de ganancias final se mantiene en "{ganancia}"'))
def verify_edge_case_win(page: Page, ganancia):
    # Damos tiempo a que termine el tiro gratis
    time.sleep(3)
    # Verificamos que Once More no nos regaló dinero erróneamente
    expect(page.locator('#win-counter')).to_have_text(ganancia)