from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.button import Button
from kivy.uix.label import Label
from kivy.uix.textinput import TextInput
from kivy.clock import Clock
import requests
from functools import partial
from datetime import datetime



# URL de votre serveur Flask
BASE_URL = "http://213.166.217.212/"

# Identifiants d'utilisateur (doivent correspondre à ceux du serveur)
USERNAME = "toto"
PASSWORD = "toto1234"

class SmartPlugApp(App):
    def build(self):
        self.layout = BoxLayout(orientation='vertical', padding=10, spacing=10)

        # Connexion
        self.username_input = TextInput(hint_text="Nom d'utilisateur", multiline=False)
        self.password_input = TextInput(hint_text="Mot de passe", multiline=False, password=True)
        self.login_button = Button(text="Se connecter", on_press=self.login)
        self.layout.add_widget(self.username_input)
        self.layout.add_widget(self.password_input)
        self.layout.add_widget(self.login_button)

        return self.layout

    def login(self, instance):
        username = self.username_input.text
        password = self.password_input.text
        if username == USERNAME and password == PASSWORD:
            self.layout.clear_widgets()  # Clear the login widgets
            self.build_main_interface()
        else:
            print("Nom d'utilisateur ou mot de passe incorrect.")

    def build_main_interface(self):
        # Affichage de l'horloge en temps réel
        self.clock_label = Label(text="Heure actuelle : --:--:--", font_size='20sp')
        self.layout.add_widget(self.clock_label)

        # Planifier une mise à jour régulière de l'horloge
        Clock.schedule_interval(self.update_clock, 1)

        # Affichage de la température
        self.temperature_label = Label(text="Température actuelle : -- °C", font_size='20sp')
        self.layout.add_widget(self.temperature_label)

        # Contrôle de la LED 1
        self.led1_status_label = Label(text="État de la LED 1 : OFF", font_size='20sp')
        self.layout.add_widget(self.led1_status_label)
        self.led1_on_button = Button(text="Allumer la LED 1", on_press=partial(self.toggle_led, 'on', 'led1'))
        self.layout.add_widget(self.led1_on_button)
        self.led1_off_button = Button(text="Éteindre la LED 1", on_press=partial(self.toggle_led, 'off', 'led1'))
        self.layout.add_widget(self.led1_off_button)

        # Contrôle de la LED 2
        self.led2_status_label = Label(text="État de la LED 2 : OFF", font_size='20sp')
        self.layout.add_widget(self.led2_status_label)
        self.led2_on_button = Button(text="Allumer la LED 2", on_press=partial(self.toggle_led, 'on', 'led2'))
        self.layout.add_widget(self.led2_on_button)
        self.led2_off_button = Button(text="Éteindre la LED 2", on_press=partial(self.toggle_led, 'off', 'led2'))
        self.layout.add_widget(self.led2_off_button)

        # Bouton pour contrôler toutes les LEDs
        self.all_leds_status_label = Label(text="Contrôle des Deux LEDs", font_size='20sp')
        self.layout.add_widget(self.all_leds_status_label)
        self.all_leds_on_button = Button(text="Allumer les Deux LEDs", on_press=partial(self.toggle_both, 'on'))
        self.layout.add_widget(self.all_leds_on_button)
        self.all_leds_off_button = Button(text="Éteindre les Deux LEDs", on_press=partial(self.toggle_both, 'off'))
        self.layout.add_widget(self.all_leds_off_button)

        # Programmation d'une plage horaire pour LED 1
        self.schedule_on_led1 = TextInput(hint_text="Heure d'allumage LED 1 (HH:MM)", multiline=False)
        self.layout.add_widget(self.schedule_on_led1)
        self.schedule_button_led1 = Button(text="Définir la programmation LED 1", on_press=partial(self.set_schedule, 'led1'))
        self.layout.add_widget(self.schedule_button_led1)

        # Programmation d'une plage horaire pour LED 2
        self.schedule_on_led2 = TextInput(hint_text="Heure d'allumage LED 2 (HH:MM)", multiline=False)
        self.layout.add_widget(self.schedule_on_led2)
        self.schedule_button_led2 = Button(text="Définir la programmation LED 2", on_press=partial(self.set_schedule, 'led2'))
        self.layout.add_widget(self.schedule_button_led2)

        # Planifier une mise à jour régulière de l'état
        Clock.schedule_interval(self.update_status, 5)

    def update_clock(self, *args):
        # Mettre à jour l'horloge en temps réel
        now = datetime.now()
        current_time = now.strftime("%H:%M:%S")
        self.clock_label.text = f"Heure actuelle : {current_time}"

    def toggle_led(self, action, led, instance):
        try:
            endpoint = f"/control1" if led == 'led1' else f"/control2"
            response = requests.post(BASE_URL + endpoint, data={'action': action}, auth=(USERNAME, PASSWORD), verify=False)
            if response.status_code == 204:
                self.update_status()
            else:
                print(f"Erreur lors du changement d'état de la LED {led}.")
        except requests.exceptions.RequestException as e:
            print(f"Erreur lors de la connexion au serveur : {e}")

    def toggle_both(self, action, instance):
        try:
            response = requests.post(BASE_URL + "/control", data={'action': action}, auth=(USERNAME, PASSWORD), verify=False)
            if response.status_code == 204:
                self.update_status()
            else:
                print("Erreur lors du changement d'état des deux LEDs.")
        except requests.exceptions.RequestException as e:
            print(f"Erreur lors de la connexion au serveur : {e}")

    def set_schedule(self, led, instance):
        on_time = self.schedule_on_led1.text if led == 'led1' else self.schedule_on_led2.text
        try:
            response = requests.post(BASE_URL + f"/schedule_{led}", json={'on': on_time}, auth=(USERNAME, PASSWORD), verify=False)
            if response.status_code == 204:
                print(f"Programmation définie avec succès pour {led}.")
            else:
                print(f"Erreur lors de la définition de la programmation pour {led}.")
        except requests.exceptions.RequestException as e:
            print(f"Erreur lors de la connexion au serveur : {e}")

    def update_status(self, *args):
        try:
            # Récupérer l'état des LEDs
            response = requests.get(BASE_URL + "/led_status", auth=(USERNAME, PASSWORD), verify=False)
            if response.status_code == 200:
                data = response.json()
                self.led1_status_label.text = f"État de la LED 1 : {data['led1_status']}"
                self.led2_status_label.text = f"État de la LED 2 : {data['led2_status']}"
            else:
                print("Erreur lors de la récupération de l'état des LEDs.")

            # Récupérer la température
            response = requests.get(BASE_URL + "/temperature", auth=(USERNAME, PASSWORD), verify=False)
            if response.status_code == 200:
                data = response.json()
                self.temperature_label.text = f"Température actuelle : {data['temperature']} °C"
            else:
                print("Erreur lors de la récupération de la température.")
        except requests.exceptions.RequestException as e:
            print(f"Erreur lors de la connexion au serveur : {e}")

if __name__ == '__main__':
    SmartPlugApp().run()