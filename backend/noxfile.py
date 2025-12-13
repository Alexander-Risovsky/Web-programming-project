import nox

@nox.session
def postgres(session):
    session.run(
        "docker-compose", "up", "-d", "postgres", external=True
    )