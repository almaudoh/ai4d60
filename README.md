# Email Validator

A pragmatic email syntax validator for Python.

## Features

- Provides `is_valid_email(email: str) -> bool`, a pragmatic email syntax validator focused on common real-world address formats.
- Enforces clear checks for structure, allowed characters, local-part/domain length limits, domain-label rules, and top-level domain constraints.
- Includes a pytest suite covering representative valid inputs, invalid formats, and edge cases for boundary-length behavior.

## Installation

No external dependencies required for the validator itself. To run the test suite:

```bash
pip install pytest
```

## Usage

```python
from email_validator import is_valid_email

# Valid emails
assert is_valid_email("user@example.com") is True
assert is_valid_email("john.doe+newsletter@sub.example.org") is True

# Invalid emails
assert is_valid_email("plainaddress") is False
assert is_valid_email("user@localhost") is False
```

## Running Tests

```bash
pytest tests/
```

Or run with verbose output:

```bash
pytest tests/ -v
```