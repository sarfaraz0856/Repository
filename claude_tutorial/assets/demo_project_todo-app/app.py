from storage import load_tasks, save_tasks

def add_task(title):
    tasks = load_tasks()
    tasks.append({"title": title, "done": False})
    save_tasks(tasks)

def list_tasks():
    for i, t in enumerate(load_tasks(), start=1):
        mark = "x" if t["done"] else " "
        print(f"{i}. [{mark}] {t['title']}")

if __name__ == "__main__":
    add_task("Learn Claude Code")
    list_tasks()
