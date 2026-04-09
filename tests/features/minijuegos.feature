Feature: Minijuegos y Eventos Especiales de la Maquinita

  Background:
    Given abro la maquinita web
    And tengo 100 creditos iniciales

  @Regresion
  Scenario Outline: Los minijuegos otorgan premios exactos y tiros correctos
    When apuesto 1 moneda a "<fruta_apuesta>"
    And fuerzo la ruleta para que caiga en "<casilla_destino>"
    And presiono el boton "START"
    Then el saldo de ganancias debe ser "<ganancia_esperada>"
    And el estado del minijuego se activa mostrando "PRESIONA START"
    When detengo el minijuego forzando el valor de "<tiros_ganados>" tiros
    Then el panel central cambia la leyenda a "¡TIROS!"
    And el saldo de creditos no disminuye por los giros gratis

    Examples:
      | fruta_apuesta | casilla_destino | ganancia_esperada | tiros_ganados |
      | cereza        | oncemore        | 0                 | 2             |
      | bar           | bar50           | 50                | 3             |
      | bar           | bar100          | 100               | 1             |

  @EdgeCase
  Scenario: Un tiro gratis que cae en Once More no da premio ni rompe el juego
    When apuesto 1 moneda a "bar"
    And fuerzo la ruleta para que caiga en "bar100"
    And presiono el boton "START"
    When detengo el minijuego forzando el valor de "1" tiros
    # Justo cuando arranca el tiro gratis, hackeamos el siguiente resultado
    And fuerzo la ruleta para que caiga en "oncemore"
    Then el saldo de ganancias final se mantiene en "100"