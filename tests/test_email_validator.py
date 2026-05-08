import pytest

from email_validator import is_valid_email


@pytest.mark.parametrize(
    "email",
    [
        "user@example.com",
        "john.doe+newsletter@sub.example.org",
        "a_b-c.d+e@my-domain.co",
        "USER123@EXAMPLE.NET",
        "x@yq.io",
    ],
)
def test_is_valid_email_accepts_valid_addresses(email: str) -> None:
    assert is_valid_email(email) is True


@pytest.mark.parametrize(
    "email",
    [
        "",
        "plainaddress",
        "missing-at.example.com",
        "two@@ats.com",
        "@example.com",
        "user@",
        ".starts.with.dot@example.com",
        "ends.with.dot.@example.com",
        "double..dot@example.com",
        "user@localhost",
        "user@-example.com",
        "user@example-.com",
        "user@example.c",
        "user@example.123",
        "user@exa mple.com",
    ],
)
def test_is_valid_email_rejects_invalid_addresses(email: str) -> None:
    assert is_valid_email(email) is False


def test_is_valid_email_rejects_too_long_local_part() -> None:
    local = "a" * 65
    assert is_valid_email(f"{local}@example.com") is False


def test_is_valid_email_rejects_too_long_domain() -> None:
    label = "a" * 63
    domain = ".".join([label, label, label, label, "com"])
    assert len(domain) > 255
    assert is_valid_email(f"user@{domain}") is False
