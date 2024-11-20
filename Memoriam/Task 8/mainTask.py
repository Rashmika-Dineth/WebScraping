from robocorp.tasks import task
from task_file_1 import task1
from task_file_2 import task2
from task_file_3 import task3
from task_file_4 import task4

@task
def main_task():
    """Main task to run tasks from different files."""
    print("Starting task 1 from task_file_1...")
    task1() 
    print("Starting task 2 from task_file_2...")
    task2() 
    print("Starting task 3 from task_file_3...")
    task3()  
    print("Starting task 3 from task_file_4...")
    task4()  
    print("All tasks completed.")
