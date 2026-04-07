Feature: Minijuegos de la Maquinita

  Scenario: El usuario gana tiros extra y no se congela la maquina
    Given abro la maquinita web
    And tengo 100 creditos iniciales
    When apuesto 1 moneda a "cereza"
    And fuerzo la ruleta para que caiga en "oncemore"
    And presiono el boton "START"
    Then el estado del minijuego se activa mostrando "PRESIONA START"
    When presiono el boton "START" para detener el minijuego
    Then el panel central cambia la leyenda a "¡TIROS!"
    And la ruleta gira de nuevo automaticamente sin descontar mi credito