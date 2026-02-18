"""
MarkdownCV - ATS Analyzer (NLP Mode)
Usa spaCy para análise semântica de currículo vs descrição de vaga.
"""

import sys
import json

def check_spacy():
    """Verifica se spaCy e modelo estão disponíveis."""
    try:
        import spacy
        try:
            spacy.load("pt_core_news_sm")
        except OSError:
            try:
                spacy.load("en_core_web_sm")
            except OSError:
                return False, "no_model"
        return True, "ok"
    except ImportError:
        return False, "no_spacy"


def load_nlp():
    """Carrega o modelo spaCy (tenta PT primeiro, depois EN)."""
    import spacy
    try:
        return spacy.load("pt_core_news_sm")
    except OSError:
        return spacy.load("en_core_web_sm")


def extract_keywords_nlp(nlp, text):
    """Extrai keywords usando NLP: substantivos, verbos, entidades nomeadas."""
    doc = nlp(text.lower())

    keywords = set()

    for ent in doc.ents:
        keywords.add(ent.text.strip())

    for token in doc:
        if token.is_stop or token.is_punct or token.is_space:
            continue
        if len(token.text) <= 2:
            continue
        if token.pos_ in ("NOUN", "PROPN", "VERB", "ADJ"):
            keywords.add(token.lemma_)

    for i in range(len(doc) - 1):
        t1, t2 = doc[i], doc[i + 1]
        if not t1.is_stop and not t2.is_stop and not t1.is_punct and not t2.is_punct:
            if len(t1.text) > 2 and len(t2.text) > 2:
                bigram = f"{t1.lemma_} {t2.lemma_}"
                keywords.add(bigram)

    return keywords


def calculate_similarity(nlp, cv_text, job_text):
    """Calcula similaridade semântica entre CV e vaga."""
    cv_doc = nlp(cv_text[:100000])  # Limitar tamanho
    job_doc = nlp(job_text[:100000])

    if cv_doc.vector_norm and job_doc.vector_norm:
        return round(cv_doc.similarity(job_doc) * 100, 1)
    return None


def analyze(cv_text, job_text):
    """Análise completa: keywords + similaridade."""
    nlp = load_nlp()

    job_keywords = extract_keywords_nlp(nlp, job_text)
    cv_lower = cv_text.lower()

    found = []
    missing = []

    for kw in sorted(job_keywords):
        if kw in cv_lower:
            found.append(kw)
        else:
            missing.append(kw)

    total = len(job_keywords)
    score = round((len(found) / total) * 100) if total > 0 else 0

    similarity = calculate_similarity(nlp, cv_text, job_text)

    return {
        "mode": "nlp",
        "score": score,
        "similarity": similarity,
        "foundKeywords": found,
        "missingKeywords": missing,
        "totalKeywords": total
    }


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "usage: ats_nlp.py <command>"}))
        sys.exit(1)

    command = sys.argv[1]

    if command == "check":
        available, reason = check_spacy()
        print(json.dumps({"available": available, "reason": reason}))

    elif command == "analyze":
        input_data = json.loads(sys.stdin.read())
        cv_text = input_data.get("cv", "")
        job_text = input_data.get("job", "")
        result = analyze(cv_text, job_text)
        print(json.dumps(result, ensure_ascii=False))

    else:
        print(json.dumps({"error": f"unknown command: {command}"}))
        sys.exit(1)


if __name__ == "__main__":
    main()
