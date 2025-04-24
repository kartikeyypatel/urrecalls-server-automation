import dotenv
import sys


if len(sys.argv) <= 2:
    print("Pass the path of the environment variables and the mode.")
    exit(-1)

dotenv_path = sys.argv[1]

if sys.argv[2] == "SET":
    dotenv.set_key(dotenv_path, "DEFAULT_USERNAME", "<replace>")
    dotenv.set_key(dotenv_path, "DEFAULT_PASSWORD", "<replace>")
elif sys.argv[2] == "RESET":
    dotenv.unset_key(dotenv_path, "DEFAULT_USERNAME")
    dotenv.unset_key(dotenv_path, "DEFAULT_PASSWORD")
