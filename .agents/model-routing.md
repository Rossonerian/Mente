# Model Routing

The Codex subagent tool currently exposes these overrides: `gpt-5.6-luna`, `gpt-5.6-terra`, `gpt-5.6-sol`,
`gpt-5.5`, and `gpt-5.4`. Exact pricing and a universal strength ranking are not exposed, so this policy relies only on
the runtime descriptions and observed configuration.

| Class | Default route | Typical work |
| --- | --- | --- |
| TINY | `gpt-5.6-luna`, low | inventory, formatting, narrow docs/tests, lint/type fixes |
| STANDARD | `gpt-5.6-terra`, medium | normal implementation, ordinary tests/refactors |
| COMPLEX | `gpt-5.6-sol`, high | difficult debugging, cross-system work, significant refactors |
| CRITICAL | `gpt-5.6-sol`, xhigh + independent review | architecture, auth/security, migrations, milestone acceptance evidence |

Start at the cheapest suitable route. Escalate once after repeated failure, unresolved ambiguity, architecture/security
impact, broad blast radius, or integration complexity. Keep BOSS dormant during routine execution. `gpt-5.5` and
`gpt-5.4` are available fallbacks, not default routes. If overrides are unavailable, inherit the active model and reduce
cost through fewer agents, smaller context, and strict task scopes.
