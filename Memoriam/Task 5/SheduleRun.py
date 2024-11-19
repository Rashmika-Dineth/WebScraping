import subprocess

def run_sema4_task(task_command):

    try:
        result = subprocess.run(
            task_command,         
            shell=True,          
            capture_output=True,   
            text=True,             
            check=True            
        )
        print("Task Output:\n", result.stdout)
    except subprocess.CalledProcessError as e:
        print("Error while running the task:")
        print(e.stderr)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

task_command = "sema4 task run ../Task1/tasks"
run_sema4_task(task_command)
