from robocorp.tasks import task
from task_file_1 import read_obituary_notices1
from task_file_2 import read_obituary_notices2
from task_file_3 import read_obituary_notices3
from task_file_4 import read_obituary_notices4

@task
def main_task():
    """Main task to run tasks from different files."""
    print("Starting task 1 from task_file_1...")
    read_obituary_notices1() 
    print("Starting task 2 from task_file_2...")
    read_obituary_notices2() 
    print("Starting task 3 from task_file_3...")
    read_obituary_notices3()  
    print("Starting task 3 from task_file_4...")
    read_obituary_notices4()  
    print("All tasks completed.")
