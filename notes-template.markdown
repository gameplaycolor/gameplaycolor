---
layout: content
title:  "Changelog"
---

{% for release in releases -%}
## [{{ release.version }}](https://github.com/gameplaycolor/gameplaycolor/releases/tag/{{ release.version }}){% if not release.is_released %} (Unreleased){% endif %}
{% for section in release.sections %}
**{{ section.title }}**

{% for change in section.changes | reverse -%}
- {{ change.description }}{% if change.scope %}{{ change.scope }}{% endif %}
{% endfor %}{% endfor %}
{% endfor %}
