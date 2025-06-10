from flask import Flask, render_template, request, jsonify
import paho.mqtt.client as mqtt
from threading import Timer, Thread
from datetime import datetime
import time

app = Flask(__name__)

VALID_USERNAME = "admin"
VALID_PASSWORD = "password"

var_username = "toto"
var_password = "toto1234"


# Paramètres MQTT
mqtt_server = "localhost"
mqtt_topic_led1 = "smartplug/etat"
mqtt_topic_led2 = "smartplug/etat2"
mqtt_topic_temp = "smartplug/temperature"

mqtt_client = mqtt.Client(protocol=mqtt.MQTTv311)
mqtt_client.connect(mqtt_server, 1883, 120)

# Variables pour stocker la température et l'état des LEDs
temperature = "--"
led1_status = "OFF"
led2_status = "OFF"
led1_schedule = None
led2_schedule = None


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if username == VALID_USERNAME and password == VALID_PASSWORD:
        return jsonify({"success": True})
    else:
        return jsonify({"success": False})

def on_message(client, userdata, msg):
    global temperature, led1_status, led2_status
    if msg.topic == mqtt_topic_temp:
        temperature = msg.payload.decode()
    elif msg.topic == mqtt_topic_led1:
        led1_status = msg.payload.decode()
    elif msg.topic == mqtt_topic_led2:
        led2_status = msg.payload.decode()

mqtt_client.on_message = on_message
mqtt_client.subscribe([(mqtt_topic_temp, 0), (mqtt_topic_led1, 0), (mqtt_topic_led2, 0)])
mqtt_client.loop_start()

# Fonction pour vérifier les horaires programmés
def check_scheduled_leds():
    global led1_schedule, led2_schedule
    now = datetime.now()

    if led1_schedule:
        schedule_time_led1 = datetime.strptime(led1_schedule, '%Y-%m-%dT%H:%M')
        if now >= schedule_time_led1:
            mqtt_client.publish(mqtt_topic_led1, "ON")
            led1_schedule = None  # Réinitialiser après l'allumage

    if led2_schedule:
        schedule_time_led2 = datetime.strptime(led2_schedule, '%Y-%m-%dT%H:%M')
        if now >= schedule_time_led2:
            mqtt_client.publish(mqtt_topic_led2, "ON")
            led2_schedule = None  # Réinitialiser après l'allumage

    # Reprogrammer la vérification toutes les minutes
    Timer(60, check_scheduled_leds).start()

# Démarrer la vérification des programmations
def start_scheduler():
    check_scheduled_leds()

# Routes Flask
@app.route('/')
def index():
    return render_template('index.html', led_status1=led1_status, led_status2=led2_status, var_username=var_username, var_password=var_password)

@app.route('/control1', methods=['POST'])
def control_led1():
    action = request.form['action']
    mqtt_client.publish(mqtt_topic_led1, action.upper())
    return ('', 204)

@app.route('/control2', methods=['POST'])
def control_led2():
    action = request.form['action']
    mqtt_client.publish(mqtt_topic_led2, action.upper())
    return ('', 204)

@app.route('/control', methods=['POST'])
def control_both():
    action = request.form['action']
    mqtt_client.publish(mqtt_topic_led1, action.upper())
    mqtt_client.publish(mqtt_topic_led2, action.upper())
    return ('', 204)

@app.route('/temperature', methods=['GET'])
def get_temperature():
    return jsonify({"temperature": temperature})

# Routes pour la programmation des LEDs avec des dates et heures
@app.route('/schedule_led1', methods=['POST'])
def schedule_led1():
    global led1_schedule
    data = request.get_json()
    led1_schedule = data['on']  # Stocke l'heure d'allumage
    return 'Programmation LED 1 enregistrée', 200

@app.route('/schedule_led2', methods=['POST'])
def schedule_led2():
    global led2_schedule
    data = request.get_json()
    led2_schedule = data['on']  # Stocke l'heure d'allumage
    return 'Programmation LED 2 enregistrée', 200

# Lancer l'application Flask et le planificateur en parallèle
if __name__ == "__main__":
    # Lancer le scheduler dans un thread séparé
    scheduler_thread = Thread(target=start_scheduler)
    scheduler_thread.start()
    
    # Démarrer l'application Flask
    app.run(host='0.0.0.0', port=5001)
