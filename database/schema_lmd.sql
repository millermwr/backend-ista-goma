-- Schéma de base de données pour le système LMD ISTA/GOMA
-- Ce schéma implémente l'architecture décrite avec les tables pour:
-- - Identité des étudiants
-- - Historique des paiements (géré par les finances)
-- - Notes académiques (remplies par les enseignants)
-- - Gestion des cours et enseignants
-- - Publication des résultats

-- Extensions PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table des utilisateurs (utilisée pour l'authentification)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    profile_picture_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED')),
    user_type VARCHAR(20) DEFAULT 'student' CHECK (user_type IN ('admin', 'direction', 'scolarite', 'inscription', 'notes', 'finance', 'rh', 'emploi_du_temps', 'attestations', 'professor', 'student')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Index pour les utilisateurs
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_status ON users(status);

-- Table des sections académiques
CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des mentions (par section)
CREATE TABLE IF NOT EXISTS mentions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(section_id, code)
);

-- Table des niveaux (L1, L2, L3, M1, M2, D1, D2, D3)
CREATE TABLE IF NOT EXISTS niveaux (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    ordre INTEGER NOT NULL
);

-- Table des années académiques
CREATE TABLE IF NOT EXISTS annees_academiques (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des semestres
CREATE TABLE IF NOT EXISTS semestres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) NOT NULL,
    name VARCHAR(50) NOT NULL,
    ordre INTEGER NOT NULL
);

-- Table des étudiants (identité étudiante)
CREATE TABLE IF NOT EXISTS etudiants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    matricule VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    postnom VARCHAR(100),
    prenom VARCHAR(100),
    date_naissance DATE,
    lieu_naissance VARCHAR(100),
    sexe VARCHAR(10) CHECK (sexe IN ('M', 'F')),
    nationalite VARCHAR(50) DEFAULT 'Congolaise',
    adresse TEXT,
    telephone VARCHAR(20),
    email VARCHAR(255),
    photo_url VARCHAR(500),
    mention_id UUID REFERENCES mentions(id),
    niveau_id UUID REFERENCES niveaux(id),
    annee_academique_id UUID REFERENCES annees_academiques(id),
    statut_financier VARCHAR(20) DEFAULT 'IMPAYE' CHECK (statut_financier IN ('IMPAYE', 'PARTIEL', 'PAYE')),
    date_inscription DATE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les étudiants
CREATE INDEX idx_etudiants_matricule ON etudiants(matricule);
CREATE INDEX idx_etudiants_mention ON etudiants(mention_id);
CREATE INDEX idx_etudiants_niveau ON etudiants(niveau_id);
CREATE INDEX idx_etudiants_statut_financier ON etudiants(statut_financier);

-- Table des cours/UE
CREATE TABLE IF NOT EXISTS cours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    credits INTEGER DEFAULT 3,
    mention_id UUID REFERENCES mentions(id),
    niveau_id UUID REFERENCES niveaux(id),
    semestre_id UUID REFERENCES semestres(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des affectations enseignant-cours
CREATE TABLE IF NOT EXISTS affectations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cours_id UUID REFERENCES cours(id) ON DELETE CASCADE,
    enseignant_id UUID REFERENCES users(id) ON DELETE CASCADE,
    annee_academique_id UUID REFERENCES annees_academiques(id),
    semestre_id UUID REFERENCES semestres(id),
    date_affectation DATE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les affectations
CREATE INDEX idx_affectations_cours ON affectations(cours_id);
CREATE INDEX idx_affectations_enseignant ON affectations(enseignant_id);
CREATE INDEX idx_affectations_annee ON affectations(annee_academique_id);

-- Table des paiements
CREATE TABLE IF NOT EXISTS paiements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    etudiant_id UUID REFERENCES etudiants(id) ON DELETE CASCADE,
    montant DECIMAL(15, 2) NOT NULL,
    type_paiement VARCHAR(50) CHECK (type_paiement IN ('INSCRIPTION', 'FRAIS_ACADEMIQUES', 'ACOMpte', 'AUTRE')),
    methode_paiement VARCHAR(50) CHECK (methode_paiement IN ('ESPECES', 'BANQUE', 'MOBILE_MONEY', 'VIREMENT')),
    reference VARCHAR(100),
    date_paiement DATE DEFAULT CURRENT_DATE,
    annee_academique_id UUID REFERENCES annees_academiques(id),
    recu_numero VARCHAR(50),
    valide_par UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les paiements
CREATE INDEX idx_paiements_etudiant ON paiements(etudiant_id);
CREATE INDEX idx_paiements_date ON paiements(date_paiement);
CREATE INDEX idx_paiements_annee ON paiements(annee_academique_id);

-- Table des notes académiques
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    etudiant_id UUID REFERENCES etudiants(id) ON DELETE CASCADE,
    cours_id UUID REFERENCES cours(id) ON DELETE CASCADE,
    enseignant_id UUID REFERENCES users(id),
    affectation_id UUID REFERENCES affectations(id),
    cote_tp DECIMAL(5, 2) CHECK (cote_tp >= 0 AND cote_tp <= 20),
    cote_examen DECIMAL(5, 2) CHECK (cote_examen >= 0 AND cote_examen <= 20),
    cote_finale DECIMAL(5, 2) CHECK (cote_finale >= 0 AND cote_finale <= 20),
    mention VARCHAR(20) CHECK (mention IN ('FAIBLE', 'INSUFFISANT', 'PASSABLE', 'ASSEZ_BIEN', 'BIEN', 'TRES_BIEN', 'EXCELLENT')),
    statut VARCHAR(20) DEFAULT 'ENCODED' CHECK (statut IN ('ENCODED', 'VALIDATED', 'PUBLISHED')),
    is_published BOOLEAN DEFAULT FALSE,
    date_encodage TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_validation TIMESTAMP,
    date_publication TIMESTAMP,
    valide_par UUID REFERENCES users(id),
    publie_par UUID REFERENCES users(id),
    annee_academique_id UUID REFERENCES annees_academiques(id),
    semestre_id UUID REFERENCES semestres(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les notes
CREATE INDEX idx_notes_etudiant ON notes(etudiant_id);
CREATE INDEX idx_notes_cours ON notes(cours_id);
CREATE INDEX idx_notes_enseignant ON notes(enseignant_id);
CREATE INDEX idx_notes_statut ON notes(statut);
CREATE INDEX idx_notes_published ON notes(is_published);
CREATE INDEX idx_notes_annee ON notes(annee_academique_id);

-- Table des publications de résultats (par section/mention)
CREATE TABLE IF NOT EXISTS publications_resultats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mention_id UUID REFERENCES mentions(id),
    niveau_id UUID REFERENCES niveaux(id),
    annee_academique_id UUID REFERENCES annees_academiques(id),
    semestre_id UUID REFERENCES semestres(id),
    est_publie BOOLEAN DEFAULT FALSE,
    date_publication TIMESTAMP,
    publie_par UUID REFERENCES users(id),
    motif TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des attestations
CREATE TABLE IF NOT EXISTS attestations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    etudiant_id UUID REFERENCES etudiants(id) ON DELETE CASCADE,
    type_attestation VARCHAR(50) CHECK (type_attestation IN ('INSCRIPTION', 'FREQUENTATION', 'REUSSITE', 'DIPLOME')),
    date_demande DATE DEFAULT CURRENT_DATE,
    date_delivrance DATE,
    delivre_par UUID REFERENCES users(id),
    numero_attestation VARCHAR(50),
    statut VARCHAR(20) DEFAULT 'EN_ATTENTE' CHECK (statut IN ('EN_ATTENTE', 'APPROUVE', 'DELIVRE', 'REFUSE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table de l'emploi du temps
CREATE TABLE IF NOT EXISTS emploi_du_temps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cours_id UUID REFERENCES cours(id),
    enseignant_id UUID REFERENCES users(id),
    salle VARCHAR(50),
    jour_semaine VARCHAR(20) CHECK (jour_semaine IN ('LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI')),
    heure_debut TIME NOT NULL,
    heure_fin TIME NOT NULL,
    annee_academique_id UUID REFERENCES annees_academiques(id),
    semestre_id UUID REFERENCES semestres(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Données initiales pour les niveaux
INSERT INTO niveaux (code, name, ordre) VALUES
('L1', 'Licence 1', 1),
('L2', 'Licence 2', 2),
('L3', 'Licence 3', 3),
('M1', 'Master 1', 4),
('M2', 'Master 2', 5),
('D1', 'Doctorat 1', 6),
('D2', 'Doctorat 2', 7),
('D3', 'Doctorat 3', 8)
ON CONFLICT (code) DO NOTHING;

-- Données initiales pour les semestres
INSERT INTO semestres (code, name, ordre) VALUES
('S1', 'Semestre 1', 1),
('S2', 'Semestre 2', 2)
ON CONFLICT (code, name) DO NOTHING;

-- Données initiales pour l'année académique courante
INSERT INTO annees_academiques (code, name, start_date, end_date, is_active) VALUES
('2024-2025', '2024-2025', '2024-09-01', '2025-08-31', TRUE)
ON CONFLICT (code) DO NOTHING;

-- Données initiales pour les sections ISTA/GOMA
INSERT INTO sections (code, name, description) VALUES
('SA', 'Sciences Appliquées', 'Section Sciences Appliquées'),
('SI', 'Sciences Informatiques', 'Section Sciences Informatiques'),
('GM', 'Génie Mécanique', 'Section Génie Mécanique'),
('EL', 'Électricité', 'Section Électricité'),
('AC', 'Aviation Civile', 'Section Aviation Civile')
ON CONFLICT (code) DO NOTHING;

-- Données initiales pour les mentions
INSERT INTO mentions (section_id, code, name, description) VALUES
((SELECT id FROM sections WHERE code = 'SI'), 'INF', 'Informatique', 'Mention Informatique'),
((SELECT id FROM sections WHERE code = 'SI'), 'GL', 'Génie Logiciel', 'Mention Génie Logiciel'),
((SELECT id FROM sections WHERE code = 'GM'), 'MEC', 'Mécanique', 'Mention Mécanique'),
((SELECT id FROM sections WHERE code = 'GM'), 'IND', 'Industriel', 'Mention Industriel'),
((SELECT id FROM sections WHERE code = 'EL'), 'ELEC', 'Électricité', 'Mention Électricité'),
((SELECT id FROM sections WHERE code = 'EL'), 'ELEC_IND', 'Électricité Industrielle', 'Mention Électricité Industrielle'),
((SELECT id FROM sections WHERE code = 'AC'), 'AVIA', 'Aviation', 'Mention Aviation Civile')
ON CONFLICT (section_id, code) DO NOTHING;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger aux tables pertinentes
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_etudiants_updated_at BEFORE UPDATE ON etudiants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cours_updated_at BEFORE UPDATE ON cours
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_publications_updated_at BEFORE UPDATE ON publications_resultats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
