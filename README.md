# gittuf Metadata Visualizer

[gittuf] is a security layer for Git repositories that enables **independently
verifiable** security policies to be defined for a repository.

This repository hosts the source code for the gittuf metadata visualizer. It's a
web app that displays gittuf metadata for a repository in an easy-to-understand
way in your web browser. The visualizer is a work-in-progress and currently in
alpha.

This project originally started as a part of the 2025 Summer Mentorship program
for gittuf. 

## What’s inside

This is a multi-project repo:

```
visualizer/
├── frontend/         # Next.js app (UI, visualizations)
└── go-backend/       # Go (Gin) API backend
```

For more information on the inner workings of the visualizer and other
development bits, see the [visualizer development] document.

## Installation and Getting Started

The gittuf metadata visualizer is currently a local-only app. To get started,
see the [getting started documentation].

## Have Questions?

Feel free to reach out on the [OpenSSF Slack] if you have questions on how the
app works, installation, or just want to say hi!

## License

The gittuf visualizer is licensed under Apache-2.0. See `LICENSE`.


## Additional docs

- Backend (Go): `go-backend/README.md`
- Frontend: `frontend/README.md`

[gittuf]: https://github.com/gittuf/gittuf
[getting started documentation]: /docs/get-started.md
[visualizer development]: /docs/development.md
[OpenSSF Slack]: https://slack.openssf.org/
