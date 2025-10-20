# gittuf Metadata Visualizer

This repository hosts the source code for the metadata visualizer for
[gittuf](https://github.com/gittuf/gittuf), a part of the 2025 Summer Mentorship
program for gittuf. This visualizer is a work-in-progress and currently in
alpha.

## What is this?

gittuf allows repositories to define a security policy without relying on a
centralized party to enforce said policy. See the
[gittuf website](https://gittuf.dev) to learn more about gittuf.

gittuf is primarily configured via the gittuf tool, which may be difficult to
use to visualize the gittuf policy for a repository, especially more complex
policies.

The visualizer is a work-in-progress tool that can be pointed at a repository
and visualize the policy as an interactive graph.

More documentation will be coming soon.

## Building the visualizer

At the moment, to use the visualizer, you must build both its components from
source: the [backend](backend/README.md) and then the
[frontend](frontend/README.md).
