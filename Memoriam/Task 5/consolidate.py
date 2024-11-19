
def combine_files(file1, file2, file3, file4, output_file):

    try:
        with open(file1, 'r') as f1:
            content1 = f1.read()

        with open(file2, 'r') as f2:
            content2 = f2.read()

        with open(file3, 'r') as f3:
            content3 = f3.read()

        with open(file4, 'r') as f4:
            content4 = f4.read()

        combined_content = content1 + "\n" + content2 + "\n" + content3 + "\n" + content4 

        with open(output_file, 'w') as out_file:
            out_file.write(combined_content)

        print(f"Successfully combined into {output_file}.")

    except FileNotFoundError as e:
        print(f"Error: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

# Example usage
file1 = "../Task 1/obituary_notices.txt"
file2 = "../Task 2/obituary_notices.txt"
file3 = "../Task 3/obituary_notices.txt"
file4 = "../Task 4/obituary_notices.txt"
output_file = "combinedNotices.txt"

combine_files(file1, file2, file3, file4, output_file)