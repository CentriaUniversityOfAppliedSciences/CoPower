# CoPower (version 0.9)

![Project is co-funded by the European Union](public/assets/logo/funder-logo-en.png)
[Project Website](https://www.interreg-npa.eu/projects/copower/home/)

## Minimum requirements:

### [Frontend (this repository)](https://github.com/CentriaUniversityOfAppliedSciences/CoPower)
```
Node.js (24 LTS)
Vue.js (3.5)
```

### [Backend](https://github.com/CentriaUniversityOfAppliedSciences/CoPower-backend)
```
PostgreSQL (16)
.NET (10)
```

### [Services](https://github.com/CentriaUniversityOfAppliedSciences/CoPower-services)
```
Python 3 (3.14)
```

## Project structure
Project is split into 3 parts
- This repository is for the front end.
- [Backend](https://github.com/CentriaUniversityOfAppliedSciences/CoPower-backend)
- [Services](https://github.com/CentriaUniversityOfAppliedSciences/CoPower-services)

## Features
- Admin functionality
- Dashboard with customisable charts
- I18N Localisation
- Measurement and sensor management
- Organisation and user management

## How to get started

1. Clone the repository
2. Change directory to project folder
3. run npm install
4. Create .env files (base, development and production), check the needed values from .env.example, .env.development.example and .env.production.example files
5. Run in dev mode (npm run dev) or build for production (npm run build)

## Building for production
1. Run the build command
```
npm run build
```

2. Copy or move the contents of dist folder to the wanted location

# Contribution Guidelines
## Missing a feature or found a bug?
Please submit it as an issue to this repository with as much explanation about the bug or feature as possible. In case of a security, do not create a new issue, send email about it to ville.peltola@centria.fi.

## License: MIT
See LICENSE for more information.

## Developers
Centria University of Applied Sciences Ltd.
- Ville Peltola (Developer)
- Fabian Sander (Project Manager)